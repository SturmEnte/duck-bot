import "dotenv/config";
import { ApplicationCommandDataResolvable, Client, GuildMember, InteractionType, PartialGuildMember } from "discord.js";
import { connect } from "mongoose";

import JoinLeaveMessage from "./models/JoinLeaveMessage";
import SilentBan from "./models/SilentBan";

import commands from "./commands";

const client: Client = new Client({
	intents: ["GuildMembers", "GuildModeration"],
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
