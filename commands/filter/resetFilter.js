const { SlashCommandBuilder } = require('discord.js');

const {DiscordUser} = require('../../main/classes/commands/discord-user.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset_filter')
		.setDescription('Resets a filter. Also resets to blacklist')
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('Resets this voice channel\'s filter. Leave blank for your global filter')
			.addChannelTypes(2)
            .setRequired(false)),
	async execute(data, interaction) {
        const currentUser = interaction.user; // user who started the command
        const channel = interaction.options.getChannel("channel");
        // if they inputted a channel
        if (channel) {
            const discordUser = data.users.get(currentUser.id);
            if (!discordUser || !discordUser.hasVoiceChannel(channel.id))
                interaction.reply({
                    content: `You have not yet signed up for ${channel}`,
                    ephemeral: true
                }).catch(console.error);
            else {
                const filter = discordUser.getFilter(channel.id);
                filter.setType("blacklist"); // also resets filter
                
                interaction.reply({
                    content: `Filter for ${channel} has been reset and is now a ${filter.getType()}`,
                    ephemeral: true
                }).catch(console.error);
            }
        }
        else {
            let discordUser = data.users.get(currentUser.id);
            if (!discordUser)
                discordUser = new DiscordUser(currentUser.id, []);
            else {
                const filter = discordUser.globalFilter;
                filter.setType("blacklist"); // also resets filter
                
                interaction.reply({
                    content: `Your global filter has been reset and is now a ${filter.getType()}`,
                    ephemeral: true
                }).catch(console.error);
            }
        }

	},
};