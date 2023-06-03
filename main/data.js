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
            return new DiscordUser(value.value.userId, value.value.voiceChannels.entries(), value.value.globalFilter);
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
let writing = false;

let lastSave = new Date();
let timeout;
let onDataFinishWriting;
const saveData = () => {
    console.log("DO NOT QUIT!!! saving ...");
    writing = true;
	try {
    	fs.writeFileSync("./main/data.txt", JSON.stringify(data, replacer));
	} catch (err) {
		console.log("error saving data");
		throw err;
	}
	console.log("data saved");
	writing = false;
	// update variables
	updated = false;
	lastSave = new Date();
	
	// used for exiting the program
	if (onDataFinishWriting)
		onDataFinishWriting();
};
const onModify = () => {
	// if it is already updated, then we don't need to do anything
    if (!updated) {
		updated = true;
        if (new Date() - lastSave >= saveCooldown * 1000) // saveCooldown is in seconds
            saveData();
        else
            timeout = setTimeout(saveData, (saveCooldown * 1000) - (new Date() - lastSave));
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
		saveData();
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
[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
	process.on(eventType, () => {
		// if data is waiting to be saved, then save immediately if possible
		if (updated) {
			// if it is not currently writing, cancel the timeout, and save immediately
			if (!writing) {
				cancelSave();
				saveData();

				// end process
				process.exit();
			}
			else {
				// if we are writing, then wait for it to finish and then exit
				onDataFinishWriting = () => {
					process.exit();
				}
			}
		}

		// end process
		process.exit();
	});
});

module.exports = {
    data: data
};