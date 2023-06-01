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
        const user = interaction.options.getUser('user');
        const channel = interaction.member.voice.channel;
        // if channel doesn't exist (user not in call)
        if (!channel) {
            // don't send dm
            await interaction.reply({
                content: `Please join a vc first`,
                ephemeral: true
            });
            return;
        }
        
        // if the user has no object yet
        if (!data.users.has(user.id))
            new DiscordUser(user.id, []);

        const discordUser = data.users.get(user.id);
        // send the user an invite link to the voice channel or text channel that the interaction creator is in
        discordUser.ring(channel, interaction.user, "wants you to join", true)
        .then(result => {
            if (result === 1) {
                interaction.reply({
                    content: `Notified ${user}\nWait to see their response`,
                    ephemeral: true
                });
                
                discordUser.getResponse(user).then(message => {
                    interaction.editReply({
                        embeds: [new MessageEmbed()
                        .setAuthor(message.author.username, message.author.avatarURL())
                        .setTitle(`${message}`)]
                    });
                    discordUser.sendMessage(user, "Message Forwarded");
                }).catch(() => {
                    interaction.editReply({
                        content: `${user} didn't respond`
                    })
                });
            }
            else
                interaction.reply({
                    content: `Failed to notify ${user} because ${result}`,
                    ephemeral: true
                });
        });

	},
};