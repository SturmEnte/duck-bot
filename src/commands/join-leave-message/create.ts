import { CommandInteraction } from "discord.js";

import JoinLeaveMessage from "../../models/JoinLeaveMessage";

const TYPES = ["join", "leave", "kick", "ban"];

export default async function (interaction: CommandInteraction) {
	const type = interaction.options.get("type");
	const channel = interaction.options.get("channel");
	const message = interaction.options.get("message");

	if (!type) {
		await interaction.reply("A type is required");
		return;
	}

	if (!TYPES.includes(String(type.value))) {
		await interaction.reply("Invalid type");
		return;
	}

	if (!channel) {
		await interaction.reply("A channel is required");
		return;
	}

	if (!message) {
		await interaction.reply("A message is required");
		return;
	}

	JoinLeaveMessage.create({
		guild: interaction.guild.id,
		channel: channel.value,
		type: type.value,
		message: message.value,
	})
		.then(async () => {
			await interaction.reply("Created message");
		})
		.catch(async (err) => {
			console.log("Failed to create join-leave message\n", err);
			await interaction.reply("Failed to create message");
		});
}
