// both used to notify data.js
const {data, onModify} = require("../../data.js");

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
        this.userIds = [];
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
        this.userIds.push(userId);
    }

    // on someone joining an empty call
    // user is the person who joined the call
    onJoin (user) {
        user.client.channels.fetch(this.channelId).then(channel => {
            for (let i = 0; i < this.userIds.length; i ++)
                data.users.get(this.userIds[i]).ring(channel, user);
        });
    }
}

module.exports = {
    VoiceChat: VoiceChat
}