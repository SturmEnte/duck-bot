import {
	CategoryChannel,
	ChannelType,
	Client,
	GuildTextBasedChannel,
	Message,
	OverwriteType,
	PartialMessage,
	TextBasedChannel,
	Attachment,
	AttachmentBuilder,
} from "discord.js";

import axios from "axios";

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
			if (message.partial) return entry.extra.channel.id == message.channel.id;
			return entry.extra.channel.id == message.channel.id && entry.target.id == message.author.id;
		});

		// Check if the deletor is the owner
		if (entry.executor.id == message.guild.ownerId) {
			return;
		}

		if (message.partial) {
			const category: CategoryChannel = <CategoryChannel>(
				await message.guild.channels.cache.find((channel) => channel.name.toLowerCase() === message.guild.id && channel.type == ChannelType.GuildCategory)
			);

			if (category) {
				const channel: GuildTextBasedChannel = <GuildTextBasedChannel>(
					category.children.cache.find((channel) => channel.name.toLowerCase() === message.channel.id && channel.type == ChannelType.GuildText)
				);

				if (channel) {
					const messageContent = await getCachedMessageContent(channel, message);

					if (messageContent) message.content = messageContent;
					else message.content = "Message content couldn't be recovered 😭";
				} else {
					message.content = "Message content couldn't be recovered 😭";
				}
			} else {
				message.content = "Message content couldn't be recovered 😭";
			}
		}

		const info = `${entry.executor.toString()} deleted a message from ${entry.target.toString()}. Here is the message content`;

		if (message.content.length > 2000 - info.length - ":\n".length) {
			await message.channel.send(info + " (next message):\n");
			await message.channel.send(message.content);
			return;
		}

		await message.channel.send(info + ":\n" + message.content);
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

		await channel.send({
			content: message.id,
			files: [new AttachmentBuilder(Buffer.from(Buffer.from(message.content, "utf8").toString("hex")), { name: "content.txt" })],
		});
	});
}

async function getCachedMessageContent(channel: TextBasedChannel, targetMessage: PartialMessage): Promise<string | undefined> {
	let content: string | undefined;

	let options = {};

	while (true) {
		const messages = await channel.messages.fetch(options);

		if (!messages.last()) break;

		let keys = messages.keys();

		for (let i = 0; i < messages.size; i++) {
			const message = messages.get(keys.next().value);

			if (message.content == targetMessage.id) {
				const attachment = message.attachments.find((attachment) => attachment.name == "content.txt");
				if (attachment) {
					const res = await axios({ url: attachment.url, method: "GET", responseType: "blob" });
					content = Buffer.from(res.data, "hex").toString("utf8");
				}
			}
		}

		if (content) break;

		options = { before: messages.last().id };
	}

	return content;
}
