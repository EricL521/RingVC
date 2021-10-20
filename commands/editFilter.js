const { SlashCommandBuilder } = require('@discordjs/builders');
const {VoiceChat} = require('../main/classes/commands/voice-chat.js');

const {data} = require('../main/data.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('editFilter')
		.setDescription('Edit your filter for a voice chat')
        .addChannelOption(option =>
            option.setName("channel")
            .setDescription("Which channel's filter to modify")
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("add_or_remove")
            .setDescription("Choose to add or remove users")
            .addChoices([
                ["add", 1],
                ["remove", 0]
            ])
            .setRequired(true))
        .addUserOption(option =>
            option.setName("user")
            .setDescription("Person that will be added or removed from the filter")
            .setRequired(true)),
	async execute(interaction) {
        const currentUser = interaction.user; // user who started the command
        const channel = interaction.options.getChannel("channel");
        const addOrRemove = interaction.options.getInteger("add_or_remove"); // 1 for add 0 for remove
        const user = interaction.options.getUser("user");
        if (!channel.isVoice) {
            interaction.reply({
                content: `You can only sign up for voice channels`,
                ephemeral: true
            });
            return; // stop the rest of function
        }

        const discordUser = data.users.get(currentUser.id);
        // if user doesn't exist or hasn't signed up for that voice channel
        if (!discordUser || !discordUser.hasVoiceChannel(channel.id)) 
            interaction.reply({
                content: `You have not yet signed up for ${channel}`,
                ephemeral: true
            });
        else {
            const filter = discordUser.getFilter(channel.id);
            if (addOrRemove === 1) {
                filter.addUser(user.id);
                interaction.reply({
                    content: `Added ${user} to your ${filter.getType()} for ${channel}`,
                    ephemeral: true
                });
            }
            else {
                editor.removeUser(user.id);
                interaction.reply({
                    content: `Removed ${user} from your ${filter.getType()} for ${channel}`,
                    ephemeral: true
                });
            }
        }

	},
};