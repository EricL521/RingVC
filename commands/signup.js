const { SlashCommandBuilder } = require('@discordjs/builders');
const {VoiceChat} = require('../main/classes/commands/voice-chat.js');

const {data} = require('../main/data.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('signup')
		.setDescription('Sign up to get "rung" when someone starts a call')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Select the call to be "rung" for')
                .setRequired(true)),
	async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const user = interaction.user;
        if (!channel.isVoice) {
            interaction.reply({
                content: `You can only sign up for voice channels`,
                ephemeral: true
            });
            return; // stop the rest of function
        }

        // update or create voice chat object
        let voiceChat = null;
        if (data.voiceChats.has(channel.id)) {
            voiceChat = data.voiceChats.get(channel.id);
            // if voice chat already has them
            if (voiceChat.hasUser(user.id)) {
                interaction.reply({
                    content: `You are already signed up for <#${channel.id}>`,
                    ephemeral: true
                });
                return; // stops the rest of the function
            }
            voiceChat.addUser(user.id);
        }
        else
            new VoiceChat(channel.id, [user.id]);
        
        interaction.reply({
            content: `Signed up for <#${channel.id}>`,
            ephemeral: true
        });
	},
};