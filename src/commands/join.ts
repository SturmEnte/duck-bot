import { CommandInteraction } from "discord.js";

import joinChannel from "../utility/joinChannel";

let global: any;

export function init(g: any) {
	global = g;
}

export async function execute(interaction: CommandInteraction) {
	let connection = await joinChannel(interaction);
	if (!connection) return;
	global.connection = connection;
	interaction.reply("Joined voice channel");
}

export const command = {
	name: "join",
	description: "Joins your current voice channel",
};
