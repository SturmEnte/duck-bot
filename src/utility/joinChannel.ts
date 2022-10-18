import { joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { CommandInteraction } from "discord.js";

export default async function (interaction: CommandInteraction): Promise<VoiceConnection | undefined> {
	const member = await interaction.guild?.members.fetch({
		user: interaction.user,
		force: true,
	});

	if (!interaction.guild) {
		interaction.reply("The music commands only work in guilds");
		return;
	}

	if (!member?.voice.channelId) {
		interaction.reply("You need to be in a channel to use this command");
		return;
	}

	return joinVoiceChannel({
		guildId: String(interaction.guild?.id),
		channelId: String(member.voice.channelId),
		adapterCreator: interaction.guild?.voiceAdapterCreator,
	});
}
