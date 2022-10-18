import { CommandInteraction } from "discord.js";

import Global from "../types/Global";

let global: Global;

module.exports.init = (g: Global) => {
	global = g;
};

module.exports.execute = async (interaction: CommandInteraction) => {
	if (!global.connection) {
		interaction.reply("I'm not playing anything");
		return;
	}

	global.connection.disconnect();
	global.connection = undefined;
	interaction.reply("Stoped playing");
};

module.exports.command = {
	name: "stop",
	description: "Stops playing and leaves the channel",
};
