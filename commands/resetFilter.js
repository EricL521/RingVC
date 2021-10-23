const { SlashCommandBuilder } = require('@discordjs/builders');
const voice = require('@discordjs/voice');

const {data} = require('../main/data.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset_filter')
		.setDescription('Resets the filter of a channel')
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('Resets this voice channel\'s filter')
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
            filter.setType("blacklist"); // also resets filter
            
            interaction.reply({
                content: `Filter for ${channel} has been reset and is now a ${filter.getType()}`,
                ephemeral: true
            });
        }
	},
};