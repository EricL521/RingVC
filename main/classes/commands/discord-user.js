// used for permission flags
const {PermissionsBitField, GuildMember} = require("discord.js");

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
	constructor (userId, voiceChannels, globalFilter, mode) {
		// update userMap
		DiscordUser.users.set(userId, this);

		this.userId = userId;
		// voice channels is a map with key channelID and value Filter
		this.voiceChannels = new WatcherMap(onModify);
		if (voiceChannels) {
			let voiceChannelsArray = Array.from(voiceChannels);
			for (let i = 0; i < voiceChannelsArray.length; i ++) 
				this.addVoiceChannel(voiceChannelsArray[i][0], voiceChannelsArray[i][1]);
		}
		
		this.globalFilter = globalFilter? globalFilter: new Filter(false);

		// store user mode (default normal)
		this.mode = mode? mode: "normal";
	}

	// adds a voice channel
	// an optional filter object
	addVoiceChannel(channelId, filter) {
		this.voiceChannels.set(
			channelId, filter? filter : new Filter(false)
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

	// whether or not a user passes the filter (and global filter)
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

	// needs channel to check if user is invisible
	getRealMode(channel) {
		// if mode is auto, check if user is invisible
		if (this.mode === "auto") {
			const user = channel.guild.members.resolve(this.userId);
			if (user && user.presence && user.presence.status === "offline") 
				return "stealth";
			return "normal";
		}
		return this.mode;
	}
	getMode() {
		return this.mode;
	}
	setMode(mode) {
		// only normal, stealth, and auto are valid modes
		if (mode !== "normal" && mode !== "stealth" && mode !== "auto") return;
		// if mode doesn't change, don't do anything
		if (this.mode === mode) return;

		this.mode = mode;

		onModify();
	}

	/*
		* channel: discordjs object of the channel the person is in
		* startedUser: discordjs object of the person who started the call / command
		* placed in between the username and the invite
		* resolves if should ring, and rejects if not
		* by default assumes that this is called from /ring command
		* need to manually check if automatic
	*/
	async shouldRing (channel, startedUser) {
		// if user can't join channel
		if (!channel.permissionsFor(this.userId).has(PermissionsBitField.Flags.Connect))
			throw new Error(`${this} can't join ${channel}`);
		// if this user is already in the voice chat
		if (channel.members.has(this.userId)) 
			throw new Error(`${this} is already in ${channel}`);
		// if the new user doesn't pass the filter
		if (!this.passesFilter(this.getFilter(channel.id), startedUser.id))
			throw new Error(`${this} blocked you`);
		// if the person ringing has blocked the user
		const startedDiscordUser = DiscordUser.users.get(startedUser.id);
		// if startedDiscordUser doesn't exist, it passes
		if (startedDiscordUser && !startedDiscordUser.passesFilter(startedDiscordUser.getFilter(channel.id), this.userId))
			throw new Error(`you blocked ${this}`);
	}
	/*
		* called only for /ring command
		* Calls shouldRing; channel and startedUser are same as for shouldRing
		* message is the reason that they should join
		* resolves if it sent, otherwise rejects with an error with the reason why it didn't send
	*/
	async ring (channel, startedUser, message) {
		return new Promise((resolve, reject) => {
			this.shouldRing(channel, startedUser).then(() => {
				channel.send({
					content: `\`@${channel.guild.members.resolve(startedUser.id).displayName}\` ${message} \`#${channel.name}\`, ${this}`,
					allowedMentions: {users: [this.userId]}
				})
				.then(resolve)
				.catch((err) => {
					reject(`the ring message to ${this} failed to send${err.rawError? ` (\`${err.rawError.message}\`)`: ""}`);
				});
			}).catch((err) => {
				reject(err.message);
			});
		});
	}

	// returns a string that pings this discordUser
	toString() {
		return `<@${this.userId}>`;
	}
}

module.exports = {
	DiscordUser: DiscordUser,
	userOnModifyFunctions: onModifyFunctions
}