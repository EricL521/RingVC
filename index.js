// data is updated basically in every file
const {data} = require('./main/data.js');

const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_VOICE_STATES
] });

// load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}


// When the client is ready, run this code (only once)
client.once('ready', async () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('voiceStateUpdate', (oldState, newState) => {
	// newstate exists
	// and if the channel has 1 person in it now
	// and if anyone has signed up for it=
	// for some reason newState can have no channel, so
	if (newState && newState.channel && newState.channel.members.size === 1 && data.voiceChats.has(newState.channelId)) {
		data.voiceChats.get(newState.channelId).onJoin(newState.member.user);
	}
});

// Login to Discord with your client's token
client.login(token);