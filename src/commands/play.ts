import { CommandInteraction, ApplicationCommandData, ApplicationCommandOptionType, VoiceStateManager } from "discord.js";

import VoiceManager from "../manager/VoiceManager";
import joinChannel from "../utility/joinChannel";
import Global from "../types/Global";

let global: Global;

module.exports.init = (g: Global) => {
	global = g;
};

module.exports.execute = async (interaction: CommandInteraction) => {
	if (!interaction.guildId) return;

	if (!global.queueMangers.has(interaction.guildId)) {
		const connection = await joinChannel(interaction);
		if (!connection) return;
		global.queueMangers.set(interaction.guildId, new VoiceManager(interaction, connection));
	}

	global.queueMangers.get(interaction.guildId)?.addToQueue(interaction);

	// const player = createAudioPlayer();

	// const resource = createAudioResource(await downloadFile(file.url));
	// player.play(resource);

	// global.connections.get(interaction.guildId)?.subscribe(player);

	// interaction.reply(`Now playing ${file.name}`);
};

export const command: ApplicationCommandData = {
	name: "play",
	description: "Play a music file",
	options: [{ name: "file", description: "The file to play", type: ApplicationCommandOptionType.Attachment, required: true }],
};
