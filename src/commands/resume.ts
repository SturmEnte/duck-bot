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

	global.voiceMangers.get(interaction.guildId)?.resume();

	interaction.reply("Resumed the playback");
}

export const command = {
	name: "resume",
	description: "Resumes the playback",
	dmPermission: false,
};
