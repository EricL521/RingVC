const { SlashCommandBuilder } = require('discord.js');

const {DiscordUser} = require('../../main/classes/commands/discord-user.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unblock')
		.setDescription('Unblocks a user from ringing you, globally')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Select a user to unblock')
                .setRequired(true)),
	async execute(data, interaction) {
		const user = interaction.user;
        const blockedUser = interaction.options.getUser('user');

        // if the user has no object yet
        if (!data.users.has(user.id))
            new DiscordUser(user.id, []);

        const discordUser = data.users.get(user.id);
		const globalFilter = discordUser.getFilter();
		if (!globalFilter.hasUser(blockedUser.id)) {
			interaction.reply({
				content: `${blockedUser} isn't blocked`,
				ephemeral: true
			});
			return;
		}
		// otherwise, add the user to the global filter
		globalFilter.removeUser(blockedUser.id);
		interaction.reply({
			content: `${blockedUser} has been unblocked`,
			ephemeral: true
		});

	},
};