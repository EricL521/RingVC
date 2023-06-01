const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

// returns an array of all files in a directory and its subdirectories
// modified slightly from https://stackoverflow.com/questions/5827612/
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

// Grab all the command files from the commands directory you created earlier
const folderPath = path.join(__dirname, 'commands');
const filePaths = getFiles(folderPath).filter(file => file.endsWith('.js'));
const commands = [];
console.log(filePaths);
// Loop over the command files and set all the commands in the collection
for (const filePath of filePaths) {
	console.log(`FILE: '${filePath}'`);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();
