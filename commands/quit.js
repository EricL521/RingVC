const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quit')
		.setDescription('Stop being "rung" for a voice chat')
		.addChannelOption(option => 
			option.setName('channel')
				.setDescription('Select the call to stop being "rung" for, or type command in voice channel')
				.setRequired(false)),
	async execute(data, interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const user = interaction.user;
        if (!channel.isVoiceBased()) {
			if (!interaction.options.getChannel('channel')) {
				const moreInfo = new ButtonBuilder()
					.setLabel('Text Channels in Voice Channels')
					.setStyle(ButtonStyle.Link)
					.setURL('https://support.discord.com/hc/en-us/articles/4412085582359-Text-Channels-Text-Chat-In-Voice-Channels')
				interaction.reply({
					content: `Please select a channel, or run this command in the Voice Channel you want to un-sign up for`,
					ephemeral: true,
					components: [new ActionRowBuilder().addComponents(moreInfo)]
				});
			}
			else {
				interaction.reply({
					content: `The channel you selected is not a Voice Channel`,
					ephemeral: true
				});
			}
			return; // stop the rest of function
		}
        
        if (data.voiceChats.has(channel.id)) {
            const voiceChat = data.voiceChats.get(channel.id);
            if (voiceChat.hasUser(user.id)) {
                voiceChat.removeUser(user.id);
                return interaction.reply({
                    content: `You will no lunger be "rung" for <#${channel.id}>`,
                    ephemeral: true
                });
            }
        }
		interaction.reply({
			content: `You aren't signed up for <#${channel.id}>`,
			ephemeral: true
		});
	},
};