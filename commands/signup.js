const { SlashCommandBuilder } = require('@discordjs/builders');
let {data} = require('../main/data.js');
const {DiscordUser} = require('../main/classes/commands/discord-user.js');

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
        const userId = interaction.user.id;
        // update or create discorduser
        let discordUser = null;
        if (data.has(userId)) {
            discordUser = data.get(userId);
            console.log(discordUser);
            discordUser.addVoiceChannel(interaction.guildId, channel.id);
        }
        else
            discordUser = new DiscordUser([
                {
                    guildId: interaction.guildId,
                    channelId: channel.id
                }
            ]);
        // update data
        data.set(userId, discordUser);
        
        interaction.reply({
            content: `Signed up for <#${channel.id}>`,
            ephemeral: true
        });
	},
};