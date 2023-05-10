import "dotenv/config";
import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, Client, InteractionType } from "discord.js";
import { connect } from "mongoose";

import Command from "./interfaces/Command";

import JoinLeaveMessage from "./models/JoinLeaveMessage";

import rename from "./commands/rename";

import createJoinLeaveMessage from "./commands/join-leave-message/create";

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
	{
		run: createJoinLeaveMessage,
		data: {
			name: "create-join-leave-message",
			description: "Join messages",
			options: [
				{
					name: "type",
					description: "Join, Leave, Kick, Ban",
					type: ApplicationCommandOptionType.String,
					choices: [
						{ name: "join", value: "join" },
						{ name: "leave", value: "leave" },
						{ name: "kick", value: "kick" },
						{ name: "ban", value: "ban" },
					],
					required: true,
				},
				{
					name: "channel",
					description: "The channel the message should be send to",
					type: ApplicationCommandOptionType.Channel,
					required: true,
				},
				{
					name: "message",
					description: "{{user}} - username",
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
	// Execute commands
	if (interaction.type != InteractionType.ApplicationCommand) return;
	commands.forEach(async (command) => {
		if (command.data.name == interaction.command?.name) {
			try {
				await command.run(interaction);
			} catch (error) {
				await interaction.reply("Error while executing command");
				console.log("Error while executing", command.data.name, ":\n", error, "\n", interaction);
			}
		}
	});
});

// Join-Leave messages
client.on("guildMemberAdd", async (member) => {
	console.log(member.user.username, "joined the server");

	const messages = await JoinLeaveMessage.find({ guild: member.guild.id, type: "join" });

	messages.forEach(async (msg) => {
		const channel = await member.guild.channels.fetch(msg.channel);
		let message = msg.message;
		message = message.replace(/{{user}}/g, member.user.username);
		if (channel.isTextBased()) await channel.send(message);
	});
});

client.on("guildMemberRemove", (member) => {
	console.log(member.user.username, "left the server");
});

client.login(process.env.TOKEN);
connect(process.env.DB)
	.then(() => console.log("Connected to the database"))
	.catch((err) => {
		console.log("Failed to connect to the database\n", err);
		process.exit();
	});
