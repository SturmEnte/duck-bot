import { CommandInteraction, ApplicationCommandData, ApplicationCommandOptionType } from "discord.js";
import { createAudioPlayer, createAudioResource } from "@discordjs/voice";

import downloadFile from "../utility/downloadFile";
import joinChannel from "../utility/joinChannel";

let global: any;

module.exports.init = (g: any) => {
	global = g;
};

module.exports.execute = async (interaction: CommandInteraction) => {
	const file = interaction.options.get("file", true).attachment;

	if (file?.contentType != "audio/mpeg") {
		interaction.reply("Wrong file type");
		return;
	}

	if (!global.connection) {
		const connection = await joinChannel(interaction);
		if (!connection) return;
		global.connection = connection;
	}

	const player = createAudioPlayer();

	const resource = createAudioResource(await downloadFile(file.url));
	player.play(resource);

	global.connection.subscribe(player);

	interaction.reply(`Now playing ${file.name}`);
};

export const command: ApplicationCommandData = {
	name: "play",
	description: "Play a music file",
	options: [{ name: "file", description: "The file to play", type: ApplicationCommandOptionType.Attachment, required: true }],
};
