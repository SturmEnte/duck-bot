import { CommandInteraction } from "discord.js";

import Global from "../types/Global";

let global: Global;

export function init(g: Global) {
	global = g;
}

export async function execute(interaction: CommandInteraction) {
	if (!interaction.guildId) return;

	if (!global.voiceMangers.has(interaction.guildId) || global.voiceMangers.get(interaction.guildId)?.currentlyPlaying == false) {
		interaction.reply("I'm not playing anything");
		return;
	}

	global.voiceMangers.get(interaction.guildId)?.stop();
	interaction.reply("Stopped playing");
}

export const command = {
	name: "stop",
	description: "Stops playing and clears the queue",
};
