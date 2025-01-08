// import fs
const fs = require('fs');

// get setting
const {saveCooldown} = require("../config.json");

// get classes
const {WatcherMap} = require('./classes/storage/watcher-map.js');
const {DiscordUser, userOnModifyFunctions} = require('./classes/commands/discord-user.js');
const {VoiceChat, voiceChatOnModifyFunctions} = require('./classes/commands/voice-chat.js');
const {Filter, filterOnModifyFunctions} = require('./classes/commands/filter.js');

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
                globalFilter: value.globalFilter,
                mode: value.mode
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
    else if (value instanceof Filter)
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
            if (value.value.userId && value.value.voiceChannels && value.value.globalFilter && value.value.mode)
                return new DiscordUser(value.value.userId, value.value.voiceChannels.entries(), value.value.globalFilter, value.value.mode);
        }
        else if (value.dataType === 'VoiceChat')
            return new VoiceChat(value.value.channelId, value.value.userIds.keys(), true);
        else if (value.dataType === 'VoiceChannelFilter')
            return new Filter(value.value.isWhitelist, value.value.list.keys());
    }
    return value;
};

// whether or not data has been updated
let updated = false;

let lastSave = new Date();
let timeout; // used to store timeout for saving during cooldown
let saved; // a promise that resolves when data is saved
const saveData = () => {
	return new Promise((resolve, reject) => {
		// update variables
		lastSave = new Date();
		updated = false;

		console.log("DO NOT QUIT!!! saving ...");
		try {
			fs.writeFileSync("./main/data.txt", JSON.stringify(data, replacer));
		} catch (err) {
			console.log("error saving data");
			reject(err);
			throw err;
		}
		console.log("data saved. YOU MAY NOW QUIT");

		resolve();
	});
};
const onModify = () => {
	// if it is already updated, then we don't need to do anything
    if (!updated) {
		updated = true;
        if (new Date() - lastSave >= saveCooldown * 1000) // saveCooldown is in seconds
            saved = saveData();
        else
            timeout = setTimeout(() => {saved = saveData()}, (saveCooldown * 1000) - (new Date() - lastSave));
    }
};
const cancelSave = () => {
    clearTimeout(timeout);
    updated = false;
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
if (fs.existsSync('./main/data.txt')) { 
	const storedText = fs.readFileSync('./main/data.txt');
	if (storedText != "") {
		JSON.parse(storedText, reviver); // parse text with reviver
		// OnModify is called when each object is created, so we need to cancel the save
		cancelSave();

		console.log("data succesfully restored from data.txt");
	}
	else {
		saved = saveData();
		console.log("data.txt was empty, so data was reset to default");
	}
}
// if data.txt doesn't exist
else {
	// creat file
	fs.writeFileSync('./main/data.txt', "");
    console.log("data.txt was empty, so data will be reset to default");
    saveData();
}

// save data when exiting
[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`].forEach((eventType) => {
	process.on(eventType, async (err) => {
		if (err)
			console.error(err);
 
		// wait for data to be saved
		await saved;

		// save immediately if data has been updated
		if (updated) {
			cancelSave();
			await saveData();
		}

		process.exit(0);
	});
});

module.exports = {
    data: data
};