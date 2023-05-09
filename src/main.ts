import "dotenv/config";
import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, Client, InteractionType } from "discord.js";

import Command from "./interfaces/Command";

import rename from "./commands/rename";

const commands: Command[] = [
	{
		run: rename,
		data: {
			name: "rename",
			description: "Rename a user",
			options: [
				{
					name: "user",
					description: "The user you want to rename",
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: "nickname",
					description: "The new nickname",
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		},
	},
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
