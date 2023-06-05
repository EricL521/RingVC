const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Getting started'),
	async execute(data, interaction) {
		interaction.reply({ 
			content: `Use /signup to be pinged when a person joins a VC, and /block and /unblock to block and unblock people from ringing you`,
			ephemeral: true 
		});
	},
};