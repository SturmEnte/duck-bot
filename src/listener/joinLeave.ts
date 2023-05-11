import { Client, GuildMember, PartialGuildMember } from "discord.js";

import JoinLeaveMessage from "../models/JoinLeaveMessage";
import SilentBan from "../models/SilentBan";

export default function (client: Client) {
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
}
