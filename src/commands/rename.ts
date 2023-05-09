import { CommandInteraction } from "discord.js";

export default async function (interaction: CommandInteraction) {
	const user = interaction.options.getUser("user", true);
	const nickname = interaction.options.get("nickname")?.value;

	if (!user) {
		await interaction.reply("A user is required!");
		return;
	}

	if (!nickname) {
		await interaction.reply("A username is required");
		return;
	}

	const member = await interaction.guild?.members.fetch(user.id);
	await member?.setNickname(String(nickname));

	await interaction.reply("Renamed user");
}
