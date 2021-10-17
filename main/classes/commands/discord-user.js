const {onModify} = require("../../data.js");
const {WatcherMap} = require("../storage/watcher-map.js");

// class for a discord user
class DiscordUser {
    /*
        userId is the user id
        voiceChannels is an array of {guildId, channelId}
    */
    constructor (voiceChannels) {
        // voice channels is a map with key guildID and values a map of channelIds
        this.voiceChannels = new WatcherMap(onModify);
        for (let i = 0; i < voiceChannels.length; i ++) {
            let voiceChannel = voiceChannels[i];
            console.log(voiceChannel);
            if (!this.voiceChannels.has(voiceChannel.guildId))
                this.voiceChannels.set(voiceChannel.guildId, new WatcherMap(onModify));
            
            this.voiceChannels.get(voiceChannel.guildId).set(
                voiceChannel.channelId, new VoiceChannelFilter(false, [])
            );
        }
    }

    // adds a voice channel
    addVoiceChannel(guildId, channelId) {
        if (!this.voiceChannels.has(guildId))
                this.voiceChannels.set(guildId, new WatcherMap(onModify));
        
        this.voiceChannels.get(guildId).set(
            channelId, new VoiceChannelFilter(false, [])
        );
    }
}

// class for whitelist or blacklist
class VoiceChannelFilter {
    /* 
        isWhitelist is a boolean
        list is the whitelist or blacklist
        list is an array of userIds
    */
    constructor(isWhitelist, list) {
        this.isWhitelist = isWhitelist;

        this.list = new WatcherMap(onModify);
        for (let userId in list)
            this.list.set(userId, 0); // value doesn't matter
    }

    // whether or not a user passes the filter
    filter(userId) {
        let listContainsUser = this.list.has(userId);

        // ^ is xor
        return !(this.isWhitelist ^ listContainsUser);
    }

    // adds a user to the filter
    addUser(userId) {
        this.list.set(userId, 0);
    }

    // removes a user from the filter
    removeUser(userId) {
        this.list.delete(userId);
    }
}

module.exports = {
    DiscordUser: DiscordUser
}