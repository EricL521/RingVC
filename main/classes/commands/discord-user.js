// used for permission flags
const {Permissions, MessageActionRow, MessageButton} = require("discord.js");

// both used to notify data.js
const onModifyFunctions = [];
const onModify = () => {
    for (let i = 0; i < onModifyFunctions.length; i ++)
        onModifyFunctions[i]();
};
const {WatcherMap} = require("../storage/watcher-map.js");

const {Filter} = require("./filter.js");

// class that represents a discord user with it's filters and such
class DiscordUser {
    static users = new WatcherMap(onModify);


    /*
        userId is the user id
        voiceChannels is an array of [channelIds, filter] with filter optional
        globalFilter is an option filter
    */
    constructor (userId, voiceChannels, globalFilter) {
        // update userMap
        DiscordUser.users.set(userId, this);

        this.userId = userId;
        // voice channels is a map with key guildID and values a map of channelIds
        this.voiceChannels = new WatcherMap(onModify);
        let voiceChannelsArray = Array.from(voiceChannels);
        for (let i = 0; i < voiceChannelsArray.length; i ++) 
            this.addVoiceChannel(voiceChannelsArray[i][0], voiceChannelsArray[i][1]);
        
        this.globalFilter = globalFilter? globalFilter: new Filter(false, []);
    }

    // adds a voice channel
    // an optional filter object
    addVoiceChannel(channelId, filter) {
        onModify();

        this.voiceChannels.set(
            channelId, filter? filter : new Filter(false, [])
        );
    }

    // removes a voice channel
    removeVoiceChannel(channelId) {
        onModify();

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

    // whether or not a user passes the filter
    passesFilter(filter, userId) {
        // if filter doesn't exist, it passes
        return (!filter || (filter.filter(userId) && this.globalFilter.filter(userId)));
    }

    /*
        * called when a call is started
        * channel: discordjs object of the channel the person joined
        * startedUser: discordjs object of the person who started the call
        * message is optional
        * placed in between the username and the invite
        * force is a boolean: whether or not to ignore how many people are in the vc, and who is being rung (still abides to filter)
        * returns 1 if it sent, and a string as the reason why it couldn't send if it didn't send
    */
    async ring (channel, startedUser, message, force) {
        // if client is not in guild cache, get fetch from discord
        if (!channel.guild.members.resolve(this.userId))
        await channel.guild.members.fetch(this.userId);

        const user = channel.client.users.resolve(this.userId);

        // if user can't join channel
        if (!channel.permissionsFor(this.userId).has(Permissions.FLAGS.CONNECT))
            return `${user} can't join ${channel}`;

        if (channel.members.has(this.userId)) // if this user is already in the voice chat
            return `${user} is already in ${channel}`;

        // if the new user doesn't pass the filter
        if (!this.passesFilter(this.getFilter(channel.id), startedUser.id))
            return `you didn't pass ${user}'s filter`;

        if ((force || this.filter(channel.id, Array.from(channel.members.keys()) ).length === 1) // if the user is the only person who passes the filter
        ) 
            return new Promise((resolve) => {
                user.createDM().then(dm => {
                    channel.createInvite({maxUses: 1}).then(invite => {
                        dm.send({
                            content: `${user}, ${startedUser.username} ${message? message: "just joined"} ${invite}`
                        }).then(() => {
                            resolve(1);
                        }).catch(() => {
                            resolve(`the messsage to ${user} failed to send`);
                        });
                    }).catch((e) => {
                        resolve(`the messsage to ${user} failed to send`);
                    })

                }).catch(() => {
                    resolve(`the messsage to ${user} failed to send`);
                });
            });

    }

    // put a userList through a filter
    // userList is an array of ids
    filter(channelId, userList) {
        let filteredList = [];
        const filter = this.getFilter(channelId);
        for (let i = 0; i < userList.length; i ++)
            if (this.passesFilter(filter, userList[i]))
                filteredList.push(userList[i]);
        return filteredList;

    }

}

module.exports = {
    DiscordUser: DiscordUser,
    userOnModifyFunctions: onModifyFunctions
}