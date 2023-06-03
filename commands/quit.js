const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quit')
		.setDescription('Stop being "rung" for a voice chat'),
	async execute(data, interaction) {
        const channel = interaction.channel;
        const user = interaction.user;
        if (!channel.isVoiceBased()) {
			const moreInfo = new ButtonBuilder()
				.setLabel('More Info')
				.setStyle(ButtonStyle.Link)
				.setURL('https://support.discord.com/hc/en-us/articles/4412085582359-Text-Channels-Text-Chat-In-Voice-Channels')
            interaction.reply({
                content: `You must run this command in the Voice Channel (the new VC text channels) you want to quit recieving 'rings' for`,
                ephemeral: true,
				components: [new ActionRowBuilder().addComponents(moreInfo)]
            });
            return; // stop the rest of function
        }
        
        if (data.voiceChats.has(channel.id)) {
            const voiceChat = data.voiceChats.get(channel.id);
            if (voiceChat.hasUser(user.id)) {
                voiceChat.removeUser(user.id);
                interaction.reply({
                    content: `You will no lunger be "rung" for <#${channel.id}>`,
                    ephemeral: true
                });
            }
            else
                interaction.reply({
                    content: `You aren't signed up for <#${channel.id}>`,
                    ephemeral: true
                });
        }
        else
            interaction.reply({
                content: `You aren't signed up for <#${channel.id}>`,
                ephemeral: true
            });
	},
};