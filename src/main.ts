import "dotenv/config";
import { ApplicationCommandDataResolvable, Client, InteractionType } from "discord.js";
import { connect } from "mongoose";

import commands from "./commands";

import joinLeave from "./listener/joinLeave";

import web from "./web";

const client: Client = new Client({
	intents: ["GuildMembers", "GuildModeration", "Guilds"],
});

client.on("ready", () => {
	console.log("Logged in as", client.user?.tag);

	// Start web server
	web(client);

	// Load listeners
	joinLeave(client);

	// Load commands
	console.log("--- Commands ---");
	let cmds: ApplicationCommandDataResolvable[] = [];
	commands.forEach((command) => {
		cmds.push(command.data);
		console.log(command.data.name);
	});
	client.application?.commands.set(cmds);
	console.log("----------------");
});

client.on("interactionCreate", async (interaction) => {
	// Execute commands
	if (interaction.type != InteractionType.ApplicationCommand) return;

	// Check if executor has admin permissions
	try {
		let member = await (await interaction.guild.fetch()).members.fetch(interaction.user.id);
		if (!member.permissions.has("Administrator", true)) {
			await interaction.reply("You are not allowed to use this command");
			return;
		}
	} catch (err) {
		console.log("Failed to verify permissions for ", interaction.user.id + ":\n", err);
		await interaction.reply("Failed to verify your permissions");
		return;
	}

	commands.forEach(async (command) => {
		if (command.data.name == interaction.command?.name) {
			try {
				await command.run(interaction);
			} catch (error) {
				await interaction.reply("Error while executing command");
				console.log("Error while executing", command.data.name, ":\n", error, "\nInteraction:\n", interaction);
			}
		}
	});
});

connect(process.env.DB)
	.then(() => {
		console.log("Connected to the database");
		client.login(process.env.TOKEN);
	})
	.catch((err) => {
		console.log("Failed to connect to the database\n", err);
		process.exit();
	});
