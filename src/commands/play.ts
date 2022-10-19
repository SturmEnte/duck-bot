import { CommandInteraction, ApplicationCommandData, ApplicationCommandOptionType, VoiceStateManager } from "discord.js";

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
	}

	global.queueMangers.get(interaction.guildId)?.addToQueue(interaction);
}

export const command: ApplicationCommandData = {
	name: "play",
	description: "Play a music file",
	options: [{ name: "file", description: "The file to play", type: ApplicationCommandOptionType.Attachment, required: true }],
};
