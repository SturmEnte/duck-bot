import { CommandInteraction, ApplicationCommandData, ApplicationCommandOptionType } from "discord.js";
import { createAudioPlayer, createAudioResource } from "@discordjs/voice";

import downloadFile from "../utility/downloadFile";
import joinChannel from "../utility/joinChannel";
import Global from "../types/Global";

let global: Global;

module.exports.init = (g: Global) => {
	global = g;
};

module.exports.execute = async (interaction: CommandInteraction) => {
	if (!interaction.guildId) return;

	const file = interaction.options.get("file", true).attachment;

	if (file?.contentType != "audio/mpeg") {
		interaction.reply("Wrong file type");
		return;
	}

	if (!global.connection.has(interaction.guildId)) {
		const connection = await joinChannel(interaction);
		if (!connection) return;
		global.connection.set(interaction.guildId, connection);
	}

	const player = createAudioPlayer();

	const resource = createAudioResource(await downloadFile(file.url));
	player.play(resource);

	global.connection.get(interaction.guildId)?.subscribe(player);

	interaction.reply(`Now playing ${file.name}`);
};

export const command: ApplicationCommandData = {
	name: "play",
	description: "Play a music file",
	options: [{ name: "file", description: "The file to play", type: ApplicationCommandOptionType.Attachment, required: true }],
};
