import { CommandInteraction } from "discord.js";

import VoiceManager from "../manager/VoiceManager";
import joinChannel from "../utility/joinChannel";
import Global from "../types/Global";

let global: Global;

export function init(g: Global) {
	global = g;
}

export async function execute(interaction: CommandInteraction) {
	if (!interaction.guildId) return;

	if (!global.queueMangers.has(interaction.guildId)) {
		const connection = await joinChannel(interaction);
		if (!connection) return;
		global.queueMangers.set(interaction.guildId, new VoiceManager(interaction, connection));
		interaction.reply("Joined the voice channel");
		return;
	} else {
		interaction.reply("I'm alreayd in a channel");
	}
}

export const command = {
	name: "join",
	description: "Joins your current voice channel",
};
