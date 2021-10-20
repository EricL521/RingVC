// both used to notify data.js
const {data, onModify} = require("../../data.js");
const {WatcherMap} = require("../storage/watcher-map.js");

const {DiscordUser} = require("./discord-user.js");

// class for a discord voice chat
class VoiceChat {
    /*
        channel is the channel object
        userIds is an array of userIds
    */
    constructor (channelId, userIds) {
        // update channel map
        data.voiceChats.set(channelId, this);

        this.channelId = channelId;
        this.userIds = new WatcherMap(onModify);
        for (let i = 0; i < userIds.length; i ++)
            this.addUser(userIds[i]);
    }

    // add a user
    addUser (userId) {
        // create new discord user if needed
        if (!data.users.has(userId))
            new DiscordUser(userId, [
                this.channelId
            ]);
        // update userIds
        this.userIds.set(userId, 0); // the value doesn't actually matter
        // update discord user
        data.users.get(userId).addVoiceChannel(this.channelId);
    }

    // removes a user
    removeUser (userId) {
        this.userIds.delete(userId);

        data.users.get(userId).removeVoiceChannel(this.channelId);
    }

    // returns if it has the user
    hasUser (userId) {
        return this.userIds.has(userId);
    }

    // on someone joining an empty call
    // user is the person who joined the call
    onJoin (user) {
        user.client.channels.fetch(this.channelId).then(channel => {
            this.userIds.foreach((value, key, map) => {
                data.users.get(key).ring(channel, user);
            }); 
        });
    }
}

module.exports = {
    VoiceChat: VoiceChat
}