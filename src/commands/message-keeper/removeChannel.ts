import { CommandInteraction } from "discord.js";

import MessageKeeper from "../../models/MessageKeeper";

export default async function (interaction: CommandInteraction) {
	const channel = interaction.options.get("channel", true).channel;

	if (!(await MessageKeeper.exists({ guild: interaction.guild.id, channel: channel.id }))) {
		await interaction.reply("Message keeper does not exist");
		return;
	}

	await MessageKeeper.deleteOne({ guild: interaction.guild.id, channel: channel.id });

	await interaction.reply("Removed message keeper");
}
