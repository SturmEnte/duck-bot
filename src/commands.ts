import { ApplicationCommandOptionType } from "discord.js";

import Command from "./interfaces/Command";

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

export default commands;
