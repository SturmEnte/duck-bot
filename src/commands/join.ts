import { CommandInteraction } from "discord.js";

import joinChannel from "../utility/joinChannel";

let global: any;

module.exports.init = (g: any) => {
	global = g;
};

module.exports.execute = async (interaction: CommandInteraction) => {
	let connection = await joinChannel(interaction);

	if (!connection) return;

	global.connection = connection;

	interaction.reply("Joined voice channel");
};

module.exports.command = {
	name: "join",
	description: "Joins your current voice channel",
};
