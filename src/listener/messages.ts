import { CategoryChannel, ChannelType, Client, GuildAuditLogs, GuildAuditLogsEntry, GuildTextBasedChannel, Message, OverwriteType } from "discord.js";

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

	client.on("messageCreate", async (message) => {
		if (!(await MessageKeeper.exists({ guild: message.guild.id, channel: message.channel.id }))) {
			return;
		}

		let category: CategoryChannel = <CategoryChannel>(
			await message.guild.channels.cache.find((channel) => channel.name.toLowerCase() === message.guild.id && channel.type == ChannelType.GuildCategory)
		);

		if (!category) {
			category = await message.guild.channels.create({
				name: message.guild.id,
				type: ChannelType.GuildCategory,
				permissionOverwrites: [{ type: OverwriteType.Role, id: message.guild.roles.everyone.id, deny: ["ViewChannel", "ReadMessageHistory"] }],
			});
		}

		let channel: GuildTextBasedChannel = <GuildTextBasedChannel>(
			category.children.cache.find((channel) => channel.name.toLowerCase() === message.channel.id && channel.type == ChannelType.GuildText)
		);

		if (!channel) {
			channel = await category.children.create({
				name: message.channel.id,
				type: ChannelType.GuildText,
				permissionOverwrites: [{ type: OverwriteType.Role, id: message.guild.roles.everyone.id, deny: ["ViewChannel", "ReadMessageHistory"] }],
			});
		}

		await channel.send(`${message.id}.${Buffer.from(message.content).toString("base64")}`);
	});
}
