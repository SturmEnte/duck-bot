import "dotenv/config";
import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, Client, GuildMember, InteractionType, PartialGuildMember } from "discord.js";
import { connect } from "mongoose";

import Command from "./interfaces/Command";

import JoinLeaveMessage from "./models/JoinLeaveMessage";
import SilentBan from "./models/SilentBan";

import rename from "./commands/rename";

import createJoinLeaveMessage from "./commands/join-leave-message/create";

import silentBanBan from "./commands/silent-ban/ban";

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
	{
		run: silentBanBan,
		data: {
			name: "silent-ban",
			description: "Silently ban a user",
			options: [
				{
					name: "user",
					description: "User that should be banned",
					type: ApplicationCommandOptionType.User,
				},
				{
					name: "user-id",
					description: "Id of the user that should be banned",
					type: ApplicationCommandOptionType.String,
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
	if (await SilentBan.exists({ guild: member.guild.id, user: member.user.id })) {
		await member.kick("Silently banned");
		return;
	}

	const messages = await JoinLeaveMessage.find({ guild: member.guild.id, type: "join" });

	messages.forEach(async (msg) => {
		const channel = await member.guild.channels.fetch(msg.channel);
		let message = msg.message;
		message = formatJoinLeaveMessage(message, member);
		if (channel.isTextBased()) await channel.send(message);
	});
});

client.on("guildMemberRemove", async (member) => {
	if (await SilentBan.exists({ guild: member.guild.id, user: member.user.id })) {
		await member.kick("Silently banned");
		return;
	}

	let type = "leave";

	// Check if kicked
	const logs = await member.guild.fetchAuditLogs({ type: 20 });

	const kickLog = logs.entries.first();
	if (kickLog) {
		const { target, createdTimestamp } = kickLog;
		if (target.id === member.id && createdTimestamp > member.joinedTimestamp) {
			type = "kick";
		}
	}

	// Check if banned
	const banList = await member.guild.bans.fetch();
	const bannedUser = banList.find((ban) => ban.user.id === member.id);
	if (bannedUser) {
		type = "ban";
	}

	const messages = await JoinLeaveMessage.find({ guild: member.guild.id, type });

	messages.forEach(async (msg) => {
		const channel = await member.guild.channels.fetch(msg.channel);
		let message = msg.message;
		message = formatJoinLeaveMessage(message, member);
		if (channel.isTextBased()) await channel.send(message);
	});
});

function formatJoinLeaveMessage(message: string, member: GuildMember | PartialGuildMember): string {
	let newMessage = message.replace(/{{user}}/g, member.user.username);
	return newMessage;
}

client.login(process.env.TOKEN);
connect(process.env.DB)
	.then(() => console.log("Connected to the database"))
	.catch((err) => {
		console.log("Failed to connect to the database\n", err);
		process.exit();
	});
