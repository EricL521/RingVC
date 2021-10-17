const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Join a VC')
        .addChannelOption(option => 
            option.setName('destination')
                .setDescription('Select a channel')
                .setRequired(true)),
	async execute(interaction) {
        const destination = interaction.options.getChannel('destination');
        interaction.member.voice.setChannel(destination)
            .then(() => { // if there's no error, then the user has been moved
                interaction.reply({
                    content: `Moved to voice channel`,
                    ephemeral: true
                });
            }).catch(error => { // if there is an error, send the user the link to the channel
                interaction.reply({
                    content: `<#${destination.id}>`,
                    ephemeral: true
                });
            });
        
	},
};