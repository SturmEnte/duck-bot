require("dotenv/config");
require("colors");

const { Client, InteractionType } = require("discord.js");

const commands = { ping: require("./commands/ping.js") };

const client = new Client({ intents: ["GuildVoiceStates"] });

client.on("ready", () => {
	console.log("Logged in as", client.user.tag.cyan);

	// Register Commands
	for (let i = 0; i < commands.length; i++) {
		commands[i].init();
		client.application.commands.create(commands[i].command);
	}
});

client.on("interactionCreate", (interaction) => {
	if (interaction.type == InteractionType.ApplicationCommand) {
		commands[interaction.commandName].execute(interaction);
	}
});

client.login(process.env.TOKEN);
