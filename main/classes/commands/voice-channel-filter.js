// both used to notify data.js
const {onModify} = require("../../data.js");
const {WatcherMap} = require("../storage/watcher-map.js");

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
    VoiceChannelFilter: VoiceChannelFilter
}