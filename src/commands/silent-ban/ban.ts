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

	if (await SilentBan.exists({ guild: interaction.guild, user: id })) {
		await interaction.reply("User id already silently banned");
		return;
	}

	SilentBan.create({
		guild: interaction.guild.id,
		user: id,
		bannedBy: interaction.member.user.id,
		bannedAt: Date.now(),
	})
		.then(async () => {
			try {
				const member = await interaction.guild.members.fetch(id);
				member
					.kick("Silently banned")
					.then(async () => {
						await interaction.reply("Succesfully banned member");
					})
					.catch(async (err) => {
						console.log("Error while kicking silently banned member:\n", err);
						await interaction.reply("Succesfully put the member on the silent ban list but failed to kick the member from the server");
					});
			} catch (err) {
				await interaction.reply("Succesfully banned member");
			}
		})
		.catch(async (err) => {
			console.log("Error while silently banning member:\n", err);
			await interaction.reply("Error while banning member");
		});
}
