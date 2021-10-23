// both used to notify data.js
const {WatcherMap} = require("../storage/watcher-map.js");
const onModifyFunctions = [];
const onModify = () => {
    for (let i = 0; i < onModifyFunctions.length; i ++)
        onModifyFunctions[i]();
};

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
        let listArray = Array.from(list);
        for (let i = 0; i < listArray.length; i ++)
            this.list.set(listArray[i], 0); // value doesn't matter
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

        // call on modify
        onModify();
    }

    // clears the filter
    clearFilter() {
        this.list = new WatcherMap(onModify);

        // call onmodify
        onModify();
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
    VoiceChannelFilter: VoiceChannelFilter,
    filterOnModifyFunctions: onModifyFunctions
}