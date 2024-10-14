// used for permission flags
const {PermissionsBitField} = require("discord.js");

// both used to notify data.js
const onModifyFunctions = [];
const onModify = () => {
	for (let i = 0; i < onModifyFunctions.length; i ++)
		onModifyFunctions[i]();
};
const {WatcherMap} = require("../storage/watcher-map.js");

const {Filter} = require("./filter.js");

// class that represents a discord user with it's filters and such
class DiscordUser {
	static users = new WatcherMap(onModify);


	/*
		userId is the user id
		voiceChannels is an array of [channelIds, filter] with filter optional
		globalFilter is an option filter
	*/
	constructor (userId, voiceChannels, globalFilter) {
		// update userMap
		DiscordUser.users.set(userId, this);

		this.userId = userId;
		// voice channels is a map with key guildID and values a map of channelIds
		this.voiceChannels = new WatcherMap(onModify);
		let voiceChannelsArray = Array.from(voiceChannels);
		for (let i = 0; i < voiceChannelsArray.length; i ++) 
			this.addVoiceChannel(voiceChannelsArray[i][0], voiceChannelsArray[i][1]);
		
		this.globalFilter = globalFilter? globalFilter: new Filter(false, []);
	}

	// adds a voice channel
	// an optional filter object
	addVoiceChannel(channelId, filter) {
		this.voiceChannels.set(
			channelId, filter? filter : new Filter(false, [])
		);
	}

	// removes a voice channel
	removeVoiceChannel(channelId) {
		this.voiceChannels.delete(channelId);
	}

	// if the user has signed up for a voice channel
	hasVoiceChannel(channelId) {
		return this.voiceChannels.has(channelId);
	}

	// get the filter for a channelId
	// if channelId is null, return global filter
	getFilter(channelId) {
		if (channelId)
			return this.voiceChannels.get(channelId);
		return this.globalFilter;
	}

	// whether or not a user passes the filter
	passesFilter(filter, userId) {
		// if filter doesn't exist, it passes
		return ((!filter || (filter.filter(userId)) && this.globalFilter.filter(userId)));
	}

	// put a userList through a filter
	// userList is an array of ids
	filter(filter, userList) {
		let filteredList = [];
		for (let i = 0; i < userList.length; i ++)
			if (this.passesFilter(filter, userList[i]))
				filteredList.push(userList[i]);
		return filteredList;
	}

	/*
		* called when a call is started
		* channel: discordjs object of the channel the person is in
		* startedUser: discordjs object of the person who started the call / command
		* message is optional
		* placed in between the username and the invite
		* isCommand is a boolean: whether or not the ring is coming from a command
		* resolves if it sent, and throws an error as the reason why it couldn't send if it didn't send
	*/
	async ring (channel, startedUser, message, isCommand) {
		// if client is not in guild cache, get fetch from discord
		if (!channel.guild.members.resolve(this.userId))
		await channel.guild.members.fetch(this.userId);

		const user = channel.client.users.resolve(this.userId);

		// if user can't join channel
		if (!channel.permissionsFor(user.id).has(PermissionsBitField.Flags.Connect))
			throw new Error(`${user} can't join ${channel}`);
		// if this user is already in the voice chat
		if (channel.members.has(user.id)) 
			throw new Error(`${user} is already in ${channel}`);
		// if the new user doesn't pass the filter
		if (!this.passesFilter(this.getFilter(channel.id), startedUser.id))
			throw new Error(`${user} blocked you`);
		// if the person ringing has blocked the user
		const startedDiscordUser = DiscordUser.users.get(startedUser.id)
		// if startedDiscordUser doesn't exist, it passes
		if (startedDiscordUser && !startedDiscordUser.passesFilter(startedDiscordUser.getFilter(channel.id), user.id))
			throw new Error(`You blocked ${user}`);
		
		if (isCommand || this.filter(startedDiscordUser?.getFilter(channel.id), 
			this.filter(this.getFilter(channel.id), 
			Array.from(channel.members.keys()))).length === 1) // if the user is the only person who passes the filter 
			return new Promise((resolve, reject) => {
				channel.send({
					content: `${user}, ${startedUser} ${message? message: "just joined"} ${channel}`,
					allowedMentions: {users: [user.id]}
				})
				.then(resolve)
				.catch(() => { reject(`the message to ${user} failed to send`); });
			});
	}

}

module.exports = {
	DiscordUser: DiscordUser,
	userOnModifyFunctions: onModifyFunctions
}