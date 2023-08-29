import { CommandInteraction } from "discord.js";

import MessageKeeper from "../../models/MessageKeeper";

export default async function (interaction: CommandInteraction) {
	const channel = interaction.options.get("channel", true).channel;

	if (await MessageKeeper.exists({ guild: interaction.guild.id, channel: channel.id })) {
		await interaction.reply("Message keeper already exists");
		return;
	}

	await MessageKeeper.create({ guild: interaction.guild.id, channel: channel.id });

	await interaction.reply("Added message keeper");
}
