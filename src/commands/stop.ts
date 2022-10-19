import { CommandInteraction } from "discord.js";

import Global from "../types/Global";

let global: Global;

module.exports.init = (g: Global) => {
	global = g;
};

module.exports.execute = async (interaction: CommandInteraction) => {
	if (!interaction.guildId) return;

	if (!global.connection.has(interaction.guildId)) {
		interaction.reply("I'm not playing anything");
		return;
	}

	global.connection.get(interaction.guildId)?.disconnect();
	global.connection.delete(interaction.guildId);
	interaction.reply("Stoped playing");
};

module.exports.command = {
	name: "stop",
	description: "Stops playing and leaves the channel",
};
