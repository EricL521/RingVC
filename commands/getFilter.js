const { SlashCommandBuilder } = require('@discordjs/builders');
const voice = require('@discordjs/voice');

const {data} = require('../main/data.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get_filter')
		.setDescription('Gets the type and list of users of a filter')
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('Get this voice channel\'s filter')
            .setRequired(true)),
	async execute(interaction) {
        const currentUser = interaction.user; // user who started the command
        const channel = interaction.options.getChannel("channel");
        if (!channel.isVoice) {
            interaction.reply({
                content: `Filters are only available on voice channels`,
                ephemeral: true
            });
            return; // stop the rest of function
        }

        const discordUser = data.users.get(currentUser.id);
        if (!discordUser || !discordUser.hasVoiceChannel(channel.id))
            interaction.reply({
                content: `You have not yet signed up for ${channel}`,
                ephemeral: true
            });
        else {
            const filter = discordUser.getFilter(channel.id);
            let userList = "";
            filter.getList().forEach((value, key, map) => {
                userList += `<@${key}>\n`;
            });
            
            interaction.reply({
                content: `__List of people in your ${filter.getType()}__\n${userList? userList: "None"}`,
                ephemeral: true
            });
        }
	},
};