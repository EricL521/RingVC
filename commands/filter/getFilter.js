const { SlashCommandBuilder } = require('discord.js');

const { DiscordUser } = require('../../main/classes/commands/discord-user.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get_filter')
		.setDescription('Gets the type and list of users of a filter')
		.addChannelOption(option => 
			option.setName('channel')
			.setDescription('Get this voice channel\'s filter. Leave blank to get global filter')
			.addChannelTypes(2)
			.setRequired(false)),
	async execute(data, interaction) {
		const currentUser = interaction.user; // user who started the command
		const channel = interaction.options.getChannel("channel");
		if (channel) {
			const discordUser = data.users.get(currentUser.id);
			if (!discordUser || !discordUser.hasVoiceChannel(channel.id))
				interaction.reply({
					content: `You have not yet signed up for ${channel}`,
					ephemeral: true
				}).catch(console.error);
			else {
				const filter = discordUser.getFilter(channel.id);
				let userList = "";
				filter.getList().forEach((value, key, map) => {
					userList += `<@${key}>\n`;
				});
				
				interaction.reply({
					content: `__List of people in your ${filter.getType()} for ${channel}__\n${userList? userList: "None"}`,
					ephemeral: true
				}).catch(console.error);
			}
		}
		else {
			let discordUser = data.users.get(currentUser.id);
			if (!discordUser)
				discordUser = new DiscordUser(currentUser.id, []);
			else {
				const filter = discordUser.getFilter();
				let userList = "";
				filter.getList().forEach((value, key, map) => {
					userList += `<@${key}>\n`;
				});
				
				interaction.reply({
					content: `__List of people in your global ${filter.getType()}__\n${userList? userList: "None"}`,
					ephemeral: true
				}).catch(console.error);
			}
		}

	},
};