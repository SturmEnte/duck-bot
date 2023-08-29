import { ApplicationCommandOptionType } from "discord.js";

import Command from "./interfaces/Command";

import rename from "./commands/rename";

import createJoinLeaveMessage from "./commands/join-leave-message/create";

import silentBan from "./commands/silent-ban/ban";
import silentUnban from "./commands/silent-ban/unban";

import addChannelMessageKeeper from "./commands/message-keeper/addChannel";
import removeChannelMessageKeeper from "./commands/message-keeper/removeChannel";

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
		run: silentBan,
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
	{
		run: silentUnban,
		data: {
			name: "silent-unban",
			description: "Unban a silently banned user",
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
	{
		run: addChannelMessageKeeper,
		data: {
			name: "add-channel-message-keeper",
			description: "Add a message keeper to a channel",
			options: [
				{
					name: "channel",
					description: "The channel",
					type: ApplicationCommandOptionType.Channel,
					required: true,
				},
			],
		},
	},
	{
		run: removeChannelMessageKeeper,
		data: {
			name: "remove-channel-message-keeper",
			description: "Remove a message keeper from a channel",
			options: [
				{
					name: "channel",
					description: "The channel",
					type: ApplicationCommandOptionType.Channel,
					required: true,
				},
			],
		},
	},
];

export default commands;
