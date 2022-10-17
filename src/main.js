require("dotenv/config");
require("colors");

const { Client, InteractionType } = require("discord.js");

const commands = { ping: require("./commands/ping.js") };

const client = new Client({ intents: ["GuildVoiceStates"] });

client.on("ready", () => {
	console.log("Logged in as", client.user.tag.cyan);

	// Register Commands
	for (const key in commands) {
		commands[key].init();
		client.application.commands.create(commands[key].command).then(() => {
			console.log("Registered", commands[key].command.name.cyan, "command");
		});
	}
});

client.on("interactionCreate", (interaction) => {
	if (interaction.type == InteractionType.ApplicationCommand) {
		commands[interaction.commandName].execute(interaction);
	}
});

client.login(process.env.TOKEN);
