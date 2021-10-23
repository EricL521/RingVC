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
    static voiceChats = new WatcherMap();


    /*
        channel is the channel object
        userIds is an array of userIds
        if overwriteNewUsers is true, then this class will not make new users (only when creating this)
    */
    constructor (channelId, userIds, overwriteNewUsers) {
        // update channel map
        VoiceChat.voiceChats.set(channelId, this);

        this.channelId = channelId;
        this.userIds = new WatcherMap(onModify);
        let userIdsArray = Array.from(userIds);
        for (let i = 0; i < userIdsArray.length; i ++)
            this.addUser(userIdsArray[i], overwriteNewUsers);
    }

    // add a user
    addUser (userId, overwriteNewUsers) {
        if (!overwriteNewUsers) {
            // create new discord user if needed
            if (!DiscordUser.users.has(userId))
                new DiscordUser(userId, []);
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
    }

    // returns if it has the user
    hasUser (userId) {
        return this.userIds.has(userId);
    }

    // on someone joining an empty call
    // user is the person who joined the call
    async onJoin (user) {
        // if the channel cache does not contain the channel 
        if (!user.client.channels.resolve(this.channelId))
            await user.client.channels.fetch(this.channelId);
        
        let channel = user.client.channels.resolve(this.channelId);
        this.userIds.forEach((value, key, map) => {
            DiscordUser.users.get(key).ring(channel, user);
        }); 
    }
}

module.exports = {
    VoiceChat: VoiceChat,
    voiceChatOnModifyFunctions: onModifyFunctions
}