const { SlashCommandBuilder } = require('discord.js');

const {DiscordUser} = require('../../main/classes/commands/discord-user.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('block')
		.setDescription('Blocks a user from ringing you, globally')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Select a user to block')
                .setRequired(true)),
	async execute(data, interaction) {
		const user = interaction.user;
        const blockedUser = interaction.options.getUser('user');

        // if the user has no object yet
        if (!data.users.has(user.id))
            new DiscordUser(user.id, []);

        const discordUser = data.users.get(user.id);
		const globalFilter = discordUser.getFilter();
		if (globalFilter.hasUser(blockedUser.id)) {
			interaction.reply({
				content: `${blockedUser} is already blocked`,
				ephemeral: true
			}).catch(console.error);
			return;
		}
		// otherwise, add the user to the global filter
		globalFilter.addUser(blockedUser.id);
		interaction.reply({
			content: `${blockedUser} has been blocked`,
			ephemeral: true
		}).catch(console.error);

	},
};