// both used to notify data.js
const onModifyFunctions = [];
const onModify = () => {
	for (let i = 0; i < onModifyFunctions.length; i ++)
		onModifyFunctions[i]();
};
const {WatcherMap} = require("../storage/watcher-map.js");

const {DiscordUser} = require("./discord-user.js");

// class for a discord voice chat
class VoiceChat {
	static voiceChats = new WatcherMap(onModify);

	/*
		channel is the channel object
		userIds is an array of userIds
		if overwriteNewUsers is true, then this class will NEVER make new users
			Only used when loading from data.js, because the users already exist with data
	*/
	constructor (channelId, userIds, overwriteNewUsers) {
		// update channel map
		VoiceChat.voiceChats.set(channelId, this);

		this.channelId = channelId;
		this.userIds = new WatcherMap(onModify);
		let userIdsArray = Array.from(userIds);
		for (const userId of userIdsArray)
			this.addUser(userId, overwriteNewUsers);
	}

	// add a user
	addUser (userId, overwriteNewUsers) {
		if (!overwriteNewUsers) {
			// create new discord user if needed
			if (!DiscordUser.users.has(userId))
				new DiscordUser(userId);
			// update discord user
			DiscordUser.users.get(userId).addVoiceChannel(this.channelId);
		}

		// update userIds
		this.userIds.set(userId, 0); // the value doesn't actually matter
	}

	// removes a user
	removeUser (userId) {
		this.userIds.delete(userId);

		DiscordUser.users.get(userId).removeVoiceChannel(this.channelId);

		// delete object if no users
		if (this.userIds.size == 0)
			VoiceChat.voiceChats.delete(this.channelId);
	}

	// returns if it has the user
	hasUser (userId) {
		return this.userIds.has(userId);
	}

	// on someone joining a call
	// user is the person who just joined the call
	async onJoin (startedUser) {
		if (!startedUser) return;
		
		// if the channel cache does not contain the channel 
		if (!startedUser.client.channels.resolve(this.channelId))
			await startedUser.client.channels.fetch(this.channelId);
		
		const channel = startedUser.client.channels.resolve(this.channelId);
		
		const startedDiscordUser = DiscordUser.users.get(startedUser.id);
		// if user is in stealth mode, don't send message
		if (startedDiscordUser && startedDiscordUser.getRealMode(channel) === "stealth")
			return;

		Promise.allSettled(
			Array.from(this.userIds.keys()).map(key => new Promise((resolve, reject) => {
				const discordUser = DiscordUser.users.get(key);
				discordUser.shouldRing(channel, startedUser, false).then(async () => {
					if (discordUser.filter(
						startedDiscordUser?.getFilter(channel.id), 
						discordUser.filter(discordUser.getFilter(channel.id), Array.from(channel.members.keys()))
					).filter(userId => {
						return DiscordUser.users.get(userId)?.getRealMode(channel) !== "stealth";
					}).length === 1) { // if the user is the only person who passes the filter
						resolve(discordUser);
					} else {
						reject("User has already been pinged for this call");
					}
				}).catch((error) => {
					reject(error);
				});
			}))
		).then((results) => {
			const filterResults = results.filter(result => result.status === "fulfilled").map(result => result.value);
			if (filterResults.length > 0)
				channel.send({
					content: `\`@${channel.guild.members.resolve(startedUser.id).displayName}\` just joined \`#${channel.name}\`, ${
						filterResults.length >= 2?
							`${filterResults.slice(0, filterResults.length - 1).join(", ")} and ${filterResults[filterResults.length - 1]}`
						: `${filterResults[0]}`
					}`,
					allowedMentions: {users: filterResults.map(value => value.userId)}
				})
				.catch(() => {}); // do nothing for now (discord permission error)
		});
	}
}

module.exports = {
	VoiceChat: VoiceChat,
	voiceChatOnModifyFunctions: onModifyFunctions
}