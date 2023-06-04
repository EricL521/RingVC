// data is updated basically in every file
const {data} = require('./main/data.js');

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
	],
	partials: [Partials.channel]
});

// recursive function to get all files in a directory and its subdirectories
const getFiles = (dir) => {
	const files = [];
	const dirents = fs.readdirSync(dir, { withFileTypes: true });
	for (const dirent of dirents) {
		const res = path.resolve(dir, dirent.name);
		if (dirent.isDirectory())
			files.push(...getFiles(res));
		else
			files.push(res);
	}
	return files;
};
// load commands
client.commands = new Collection();
const folderPath = path.join(__dirname, 'commands');
const filePaths = getFiles(folderPath).filter(file => file.endsWith('.js'));

for (const filePath of filePaths) {
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code
client.once('ready', async () => {
	console.log('Ready');
})
client.on('shardError', async () => {
	console.log('disconnected');
});
client.on('shardReconnecting', async () => {
	console.log('reconnecting');
});
client.on('shardResume', () => {
	console.log('reconnected');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(data, interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// for buttons
client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;

	console.log(interaction);
});

client.on('voiceStateUpdate', (oldState, newState) => {
	// first condition is to check if user has joined a channel
	// second condition is to check if user is joining a new channel
	// third condition is to check if the channel has a voiceChat object
	if (newState?.channel && (!oldState || oldState.channelId !== newState.channelId) && data.voiceChats.has(newState.channelId))
		data.voiceChats.get(newState.channelId).onJoin(newState.member.user);
});

// Login to Discord with your client's token
client.login(token);