const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

const {VoiceChat} = require('../main/classes/commands/voice-chat.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('signup')
		.setDescription('Sign up to get "rung" when someone starts a call')
		.addChannelOption(option => 
			option.setName('channel')
				.setDescription('Select the call to be "rung" for, or type command in voice channel')
				.addChannelTypes(2)
				.setRequired(false)),
	async execute(data, interaction) {
		const channel = interaction.options.getChannel('channel') || interaction.channel;
		const user = interaction.user;
		if (!channel.isVoiceBased()) {
			const moreInfo = new ButtonBuilder()
				.setLabel('Text Channels in Voice Channels')
				.setStyle(ButtonStyle.Link)
				.setURL('https://support.discord.com/hc/en-us/articles/4412085582359-Text-Channels-Text-Chat-In-Voice-Channels')
			interaction.reply({
				content: `Please select a channel, or run this command in the Voice Channel you want to sign up for`,
				ephemeral: true,
				components: [new ActionRowBuilder().addComponents(moreInfo)]
			}).catch(console.error);
			return; // stop the rest of function
		}

		// update or create voice chat object
		let voiceChat = null;
		if (data.voiceChats.has(channel.id)) {
			voiceChat = data.voiceChats.get(channel.id);
			// if voice chat already has them
			if (voiceChat.hasUser(user.id)) {
				interaction.reply({
					content: `You are already signed up for <#${channel.id}>. Use /unsignup to unsignup`,
					ephemeral: true
				}).catch(console.error);
				return; // stops the rest of the function
			}
			voiceChat.addUser(user.id);
		}
		else
			new VoiceChat(channel.id, [user.id]);
		
		interaction.reply({
			content: `Signed up for <#${channel.id}>. Use /unsignup to unsignup`,
			ephemeral: true
		}).catch(console.error);
	},
};