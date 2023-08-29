import { Client, GuildAuditLogs, GuildAuditLogsEntry, Message } from "discord.js";

import MessageKeeper from "../models/MessageKeeper";

export default function (client: Client) {
	// Message keeper
	client.on("messageDelete", async (message) => {
		// Check if there is a message keeper for that channel
		if (!(await MessageKeeper.exists({ guild: message.guild.id, channel: message.channel.id }))) {
			return;
		}

		// Get info about who deleted the message
		const logs = await message.guild.fetchAuditLogs({ type: 72 });
		const entry = logs.entries.find((entry) => {
			return entry.target.id == message.author.id && entry.extra.channel.id == message.channel.id;
		});

		// Check if the deletor is the owner
		if (entry.executor.id == message.guild.ownerId) {
			return;
		}

		await message.channel.send(
			`${entry.executor.toString()} deleted a message from ${entry.target.toString()}. Here is the message content:\n${message.content}`
		);
	});
}
