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
        // update or create voice chat object
        let voiceChat = null;
        if (data.voiceChats.has(channel.id)) {
            voiceChat = data.voiceChats.get(channel.id);
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