import { CommandInteraction } from "discord.js";

import Global from "../types/Global";

let global: Global;

export function init(g: Global) {
	global = g;
}

export async function execute(interaction: CommandInteraction) {
	if (!interaction.guildId) return;

	// if (!global.connections.has(interaction.guildId)) {
	// 	interaction.reply("I'm not playing anything");
	// 	return;
	// }

	// global.connections.get(interaction.guildId)?.disconnect();
	// global.connections.delete(interaction.guildId);
	interaction.reply("Stoped playing");
}

export const command = {
	name: "stop",
	description: "Stops playing and leaves the channel",
};
