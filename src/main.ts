import "dotenv/config";
import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, Client, InteractionType } from "discord.js";

import Command from "./interfaces/Command";
const commands: Command[] = [
];

const client: Client = new Client({
	intents: ["GuildMembers"],
});

client.on("ready", () => {
	console.log("Logged in as", client.user?.tag);

	// Load commands
	let cmds: ApplicationCommandDataResolvable[] = [];
	commands.forEach((command) => {
		cmds.push(command.data);
	});
	client.application?.commands.set(cmds);
});

client.on("interactionCreate", (interaction) => {
	if (interaction.type != InteractionType.ApplicationCommand) return;
	commands.forEach((command) => {
		if (command.data.name == interaction.command?.name) {
			command.run(interaction);
		}
	});
});

client.login(process.env.TOKEN);
