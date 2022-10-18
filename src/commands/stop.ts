import { CommandInteraction } from "discord.js";

let global: any;

module.exports.init = (g: any) => {
	global = g;
};

module.exports.execute = async (interaction: CommandInteraction) => {
	global.connection.disconnect();
	global.connection = undefined;
	interaction.reply("Stoped playing");
};

module.exports.command = {
	name: "stop",
	description: "Stops playing and leaves the channel",
};
