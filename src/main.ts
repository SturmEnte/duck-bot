import "colors";
import "dotenv/config";
import { Client, Interaction, InteractionType } from "discord.js";

import Global from "./types/Global";

const commands: any = {
	ping: require("./commands/ping"),
	join: require("./commands/join"),
	play: require("./commands/play"),
	stop: require("./commands/stop"),
};

const client: Client = new Client({
	intents: ["GuildMembers", "GuildVoiceStates"],
});

let global: Global = { queueMangers: new Map() };

client.on("ready", () => {
	console.log("Logged in as", client.user?.tag.cyan);

	// Register Commands
	for (const key in commands) {
		commands[key].init(global);
		client.application?.commands.create(commands[key].command).then(() => {
			console.log("Registered", commands[key].command.name.cyan, "command");
		});
	}
});

client.on("interactionCreate", (interaction: Interaction) => {
	if (interaction.type == InteractionType.ApplicationCommand) {
		commands[interaction.commandName].execute(interaction);
	}
});

client.login(process.env.TOKEN);
