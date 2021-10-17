const { SlashCommandBuilder } = require('@discordjs/builders');
const voice = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ring')
		.setDescription('Rings a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Select a user')
                .setRequired(true)),
	async execute(interaction) {
        const user = interaction.options.getUser('user');
        let inviteLink = null;
        if (interaction.member.voice.channel)
            inviteLink = await interaction.member.voice.channel.createInvite({maxUses: 1});
        else {
            // don't send dm
            await interaction.reply({
                content: `Please join a vc first`,
                ephemeral: true
            });
            return;
        }
        
        // send the user an invite link to the voice channel or text channel that the interaction creator is in
        (await user.createDM()).send({
            content: `${user}, ${interaction.user.username} wants you to join them at ${inviteLink}`
        });
        // bot can't call in a dm yet, so
        // voice.joinVoiceChannel({
        //     channelId: user.dmChannel.id,
        //     guildId: "@me",
        //     selfMute: true,
        //     selfDeaf: true,
        //     adapterCreator: interaction.guild.voiceAdapterCreator
        // });

		await interaction.reply({
            content: `Ringing ${user.username}`,
            ephemeral: true
        });
	},
};