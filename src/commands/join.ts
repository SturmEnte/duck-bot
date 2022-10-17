import { CommandInteraction } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";

module.exports.init = () => {};

module.exports.execute = async (interaction: CommandInteraction) => {
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

	joinVoiceChannel({
		guildId: String(interaction.guild.id),
		channelId: String(member.voice.channelId),
		adapterCreator: interaction.guild.voiceAdapterCreator,
	});

	interaction.reply("Joined voice channel");
};

module.exports.command = {
	name: "join",
	description: "Joins your current voice channel",
};
