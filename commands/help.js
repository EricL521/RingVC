const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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
				.setDescription('RingVC is a bot which tries to replicate Group Chat Voice Calls in Discord Servers')
				.addFields(
					{ name: 'Signing up', value: 'Use /signup to start being rung when someone "starts" a call in the specified voice channel' },
					{ name: 'Quitting', value: 'Use /quit or /unsignup to stop being rung for a voice channel' },
					{ name: 'Ringing', value: 'What the bot was named after. Use /ring to ping someone to join once you\'re in a voice channel' },
					{ name: 'Blocking people', value: 'Don\'t want to be rung by someone? Use /block to block people, and /unblock to unblock them. *This means you won\'t be pinged if they "start" a voice call, however, once an unblocked person joins, you will be pinged*' },
					{ name: 'Modes', value: 'Allows you to not ping people when joining a voice channel. Use \'/mode help\' for more info' },
					{ name: 'Other commands', value: 'Other than the basics above, you can use /edit_filter, /get_filter, and /reset_filter, to manage your filters more in depth'},
					{ name: 'Support Server', value: 'If something isn\'t working for you, or you\'d like to suggest some new features, feel free to join the support server linked below! Or just say hello :)' },
					{ name: 'Github', value: 'Check out the github linked below if you want to host your own version of this bot, or just view the code' }
				)
			],
			components: [
				new ActionRowBuilder().addComponents(
					new ButtonBuilder()
					.setLabel('Github')
					.setStyle(ButtonStyle.Link)
					.setURL('https://github.com/EricL521/RingVC')
				).addComponents(
					new ButtonBuilder()
					.setLabel('Support Server')
					.setStyle(ButtonStyle.Link)
					.setURL('https://discord.gg/bxBePEnndq')
				)
			],
			ephemeral: true 
		}).catch(console.error);
	},
};