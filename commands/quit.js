// literally the same as signup.js but with a different name
const { SlashCommandBuilder } = require('discord.js');
const unsignup = require('./unsignup.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quit')
		.setDescription('Stop being "rung" for a voice chat')
		.addChannelOption(option => 
			option.setName('channel')
				.setDescription('Select the call to stop being "rung" for, or type command in voice channel')
				.addChannelTypes(2)
				.setRequired(false)),
	async execute(data, interaction) {
        unsignup.execute(data, interaction);
	},
};