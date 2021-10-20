const { SlashCommandBuilder } = require('@discordjs/builders');
const voice = require('@discordjs/voice');

const {data} = require('../main/data.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quit')
		.setDescription('Stop being "rung" for a voice chat')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Select the call to stop being "rung" for')
                .setRequired(true)),
	async execute(interaction) {
        const user = interaction.user;
        const channel = interaction.options.getChannel('channel');
        if (!channel.isVoice) {
            interaction.reply({
                content: `You can only sign up for voice channels`,
                ephemeral: true
            });
            return; // stop the rest of function
        }
        
        if (data.voiceChats.has(channel.id)) {
            const voiceChat = data.voiceChats.get(channel.id);
            if (voiceChat.hasUser(user.id)) {
                voiceChat.removeUser(user.id);
                interaction.reply({
                    content: `You will no lunger be "rung" for <#${channel.id}>`,
                    ephemeral: true
                });
            }
            else
                interaction.reply({
                    content: `You aren't signed up for <#${channel.id}>`,
                    ephemeral: true
                });
        }
        else
            interaction.reply({
                content: `You aren't signed up for <#${channel.id}>`,
                ephemeral: true
            });
	},
};