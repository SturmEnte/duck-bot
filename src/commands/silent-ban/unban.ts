import { CommandInteraction, GuildMember } from "discord.js";

import SilentBan from "../../models/SilentBan";

export default async function (interaction: CommandInteraction) {
	const user = interaction.options.getMember("user");
	const userId = interaction.options.get("user-id");

	if (!user && !userId) {
		await interaction.reply("A user or user id is required");
		return;
	}

	let id: string;

	if (user && (user as GuildMember).id) {
		id = (user as GuildMember).id;
	} else if (userId.value) {
		id = String(userId.value);
	}

	if (!id) {
		await interaction.reply("No user id was found");
		return;
	}

	if (id == interaction.client.user.id) {
		await interaction.reply("I won't ban myself :wink:");
		return;
	}

	if (!(await SilentBan.exists({ guild: interaction.guild, user: id }))) {
		await interaction.reply("User is not silently banned");
		return;
	}

	SilentBan.deleteOne({ guild: interaction.guild, user: id })
		.then(async () => {
			await interaction.reply("Unbaned user " + id);
		})
		.catch(async (err) => {
			console.log("Failed to unban user", id + ":\n", err);
			await interaction.reply("Failed to unban user " + id);
		});
}
