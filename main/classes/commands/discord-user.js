// used for permission flags
const {Permissions} = require("discord.js");

// both used to notify data.js
const {data, onModify} = require("../../data.js");
const {WatcherMap} = require("../storage/watcher-map.js");

const {VoiceChannelFilter} = require("./voice-channel-filter.js");

// class that represents a discord user with it's filters and such
class DiscordUser {
    /*
        userId is the user id
        voiceChannels is an array of channelIds
    */
    constructor (userId, voiceChannels) {
        // update userMap
        data.users.set(userId, this);

        this.userId = userId;
        // voice channels is a map with key guildID and values a map of channelIds
        this.voiceChannels = new WatcherMap(onModify);
        for (let i = 0; i < voiceChannels.length; i ++) {
            this.addVoiceChannel(voiceChannels[i]);
        }
    }

    // adds a voice channel
    addVoiceChannel(channelId) {
        this.voiceChannels.set(
            channelId, new VoiceChannelFilter(false, [])
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
    getFilter(channelId) {
        return this.voiceChannels.get(channelId);
    }

    // called when a call is started
    // channel: discordjs object of the channel the person joined
    // startedUser: discordjs object of the person who started the call
    // message is optional
    // placed in between the username and the invite
    async ring (channel, startedUser, message) {
        // if user can join channel
        if (channel.permissionsFor(this.userId).has(Permissions.FLAGS.CONNECT)) {
            let filter = this.getFilter(channel.id);
            let user = await channel.client.users.fetch(this.userId);
            
            // if filter doesn't exist that means that the user is not registered for the channel yet
            // so someone is ringing them (with ring command)
            if (!filter || filter.filter(startedUser.id)) {
                let dm = await user.createDM();
                let invite = await channel.createInvite({maxUses: 1})
                dm.send({
                    content: `${user}, ${startedUser.username} ${message? message: "just joined"} ${invite}`
                });
            }
        }

    }

}

module.exports = {
    DiscordUser: DiscordUser
}