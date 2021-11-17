// import fs
const fs = require('fs');

// get setting
const {saveCooldown} = require("../config.json");

// get classes
const {WatcherMap} = require('./classes/storage/watcher-map.js');
const {DiscordUser, userOnModifyFunctions} = require('./classes/commands/discord-user.js');
const {VoiceChat, voiceChatOnModifyFunctions} = require('./classes/commands/voice-chat.js');
const {VoiceChannelFilter, filterOnModifyFunctions} = require('./classes/commands/voice-channel-filter.js');

// stolen from https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
const replacer = (key, value) => {
    if(value instanceof Map)
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    else if (value instanceof DiscordUser)
        return {
            dataType: 'DiscordUser',
            value: {
                userId: value.userId,
                voiceChannels: value.voiceChannels,
                globalFilter: value.globalFilter
            }
        };
    else if (value instanceof VoiceChat)
        return {
            dataType: 'VoiceChat',
            value: {
                channelId: value.channelId,
                userIds: value.userIds
            }
        };
    else if (value instanceof VoiceChannelFilter)
        return {
            dataType: 'VoiceChannelFilter',
            value: {
                isWhitelist: value.isWhitelist,
                list: value.list
            }
        };
    else
        return value;
};
const reviver = (key, value) => {
    if(typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map')
            return value.value.reduce((map, object) => {
                map.set(object[0], object[1]);
                return map;
            }, new WatcherMap(onModify, null));
        else if (value.dataType === 'DiscordUser') {
            return new DiscordUser(value.value.userId, value.value.voiceChannels.entries(), value.value.globalFilter);
        }
        else if (value.dataType === 'VoiceChat')
            return new VoiceChat(value.value.channelId, value.value.userIds.keys(), true);
        else if (value.dataType === 'VoiceChannelFilter')
            return new VoiceChannelFilter(value.value.isWhitelist, value.value.list.keys());
    }
    return value;
};

let saving = false;
let lastSave = new Date();
let timeout;
const saveData = () => {
    console.log("saving ...");
    fs.writeFile("./main/data.txt", JSON.stringify(data, replacer), (err) => {
        if (err) throw err;
        console.log("data saved");
    });

    // update variables
    saving = false;
    lastSave = new Date();
};
const onModify = () => {
    if (!saving) {
        if (new Date() - lastSave >= saveCooldown * 1000) // saveCooldown is in seconds
            saveData();
        else {
            timeout = setTimeout(saveData, (saveCooldown * 1000) - (new Date() - lastSave));
            saving = true;
        }
    }
};
const cancelSave = () => {
    clearTimeout(timeout);
};
// set up modify functions
userOnModifyFunctions.push(onModify);
voiceChatOnModifyFunctions.push(onModify);
filterOnModifyFunctions.push(onModify);

const data = {
    voiceChats: VoiceChat.voiceChats,
    users: DiscordUser.users,
};
// read data.txt
const storedText = fs.readFileSync('./main/data.txt');
if (storedText != "") {
    const storedJSON = JSON.parse(storedText, reviver); // parse text with reviver
    // NOTE: as the classes are made, they are already set up so storeJSON isn't needed
    cancelSave();

    console.log("data succesfully restored from data.txt");
}
// if data.txt is empty
else {
    saveData();
    console.log("data.txt was empty, so data was reset to default");
}

module.exports = {
    data: data
};