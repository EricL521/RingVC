const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Getting started'),
	async execute(data, interaction) {
		interaction.reply({ 
			embeds: [
				new EmbedBuilder()
				.setColor('#b574c5')
				.setTitle('Getting Started')
				.setDescription('RingVC is a bot which pings you automatically when someone "starts" a voice call in a channel')
				.addFields(
					{ name: 'Signing up', value: 'Use /signup to start being rung when someone joins the specified voice channel' },
					{ name: 'Quitting', value: 'Use /quit or /unsignup to stop being rung for a voice channel' },
					{ name: 'Ringing', value: 'What the bot was named after. Use /ring to ping someone once you\'re in a voice channel' },
					{ name: 'Blocking people', value: 'Don\'t want to be rung by someone? Use /block to block people, and /unblock to unblock them. *This means you won\'t be pinged if they "start" a voice call*' },
					{ name: 'Other commands', value: 'Other than the basics above, you can use /edit_filter, /get_filter, and /reset_filter, to manage your filters more in depth'}
				)
			],
			ephemeral: true 
		});
	},
};