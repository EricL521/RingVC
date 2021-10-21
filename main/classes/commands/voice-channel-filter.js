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
    

    // return whitelist or blacklist
    getType() {
        return this.isWhitelist? "whitelist": "blacklist";
    }

    // sets the mode for a filter
    // string "whitelist" or "blacklist", defaults to blacklist
    // also clears filter
    setType(type) {
        this.isWhitelist = (type === "whitelist")? true: false;

        this.clearFilter();
    }

    // clears the filter
    clearFilter() {
        this.list = new WatcherMap(onModify);
    }


    // return map of userIds
    getList() {
        return this.list;
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