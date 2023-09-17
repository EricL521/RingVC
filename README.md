# RingVC
A discord bot that "calls"* people when someone joins an empty vc in a server that they signed up for
* Discord bots can't actually call people, so it just DMs them
* There's a config.json file too, but it's added to gitignore
	* Needs "token", which is the discord token used to log into bot
	* Also, a "saveCooldown", which is how long it waits between saving, if needed
* Once you have that, use "node deploy-commands.js" to deploy commands, then "node index.js" to start bot

### I'm hosting it also, if you wanna add it [here](https://discord.com/api/oauth2/authorize?client_id=885686322973536267&permissions=2048&scope=bot)
