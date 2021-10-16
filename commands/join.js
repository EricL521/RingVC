const { SlashCommandBuilder } = require('@discordjs/builders');
const { Console } = require('console');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Join a VC')
        .addChannelOption(option => option.setName('destination').setDescription('Select a channel')),
	async execute(interaction) {
        await interaction.member.voice.setChannel(
            interaction.options.getChannel('destination')
        ).then(() => { // if there's no error, then the user has been moved
            interaction.reply({
                content: `Moved to voice channel`,
                ephemeral: true
            });
        }).catch(error => { // if there is an error, send the user the link to the channel
            interaction.reply({
                content: `<#${interaction.options.getChannel('destination').id}>`,
                ephemeral: true
            });
        });
	},
};