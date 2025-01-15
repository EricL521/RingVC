const { SlashCommandBuilder, MessageEmbed } = require('discord.js');

const {DiscordUser} = require('../main/classes/commands/discord-user.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ring')
		.setDescription('Rings a user')
		.addUserOption(option => 
			option.setName('user')
				.setDescription('Select a user')
				.setRequired(true)),
	async execute(data, interaction) {
		// command must be run in a guild
		if (!interaction.member) {
			interaction.reply({
				content: `This command must be run in a Discord server`,
				ephemeral: true
			}).catch(console.error);
			return;
		}

		const user = interaction.options.getUser('user');
		const channel = interaction.member.voice.channel;
		// if channel doesn't exist (user not in call)
		if (!channel) {
			// don't send dm
			interaction.reply({
				content: `Please join a vc first`,
				ephemeral: true
			}).catch(console.error);
			return;
		}
		
		// if the user has no object yet
		if (!data.users.has(user.id))
			new DiscordUser(user.id, []);

		const discordUser = data.users.get(user.id);
		// send the user an invite link to the voice channel or text channel that the interaction creator is in
		Promise.allSettled([
			interaction.deferReply({ ephemeral: true }),
			discordUser.ring(channel, interaction.user, "wants you to join", true),
		]).then((results) => {
			// if deferReply failed, then there isn't a reply to edit
			if (results[0].status === "rejected") return;
			// otherwise, edit the reply to update about the ring
			if (results[1].status === "fulfilled") {
				interaction.editReply({
					content: `Notified ${user}`,
					ephemeral: true
				}).catch(console.error);
			}
			else {
				interaction.editReply({
					content: `Can't notify ${user} because ${results[1].reason.message}`,
					ephemeral: true
				}).catch(console.error);
			}
		});
	},
};