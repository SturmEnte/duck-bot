import { AudioPlayer, VoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import { CommandInteraction, TextBasedChannel } from "discord.js";

import downloadFile from "../utility/downloadFile";

export default class QueueManger {
	public connection: VoiceConnection;

	private player: AudioPlayer;
	private channel: TextBasedChannel | undefined;
	private queue: Array<any>;

	private currentlyPlaying: boolean;

	constructor(interaction: CommandInteraction, connection: VoiceConnection) {
		this.player = createAudioPlayer();
		this.queue = [];
		this.connection = connection;
		this.currentlyPlaying = false;
		this.connection.subscribe(this.player);

		console.log(interaction);
		interaction.guild?.channels.fetch(interaction.channelId).then((channel) => {
			if (channel != null && channel?.isTextBased()) this.channel = channel;
		});
	}

	public addToQueue(interaction: CommandInteraction) {
		const file = interaction.options.get("file", true).attachment;

		if (file?.contentType != "audio/mpeg") {
			interaction.reply("Wrong file type");
			return;
		}

		this.queue.push({
			name: file.name,
			url: file.url,
		});

		if (!this.currentlyPlaying) this.play();

		interaction.reply(`Added ${file.name} to the queue`);
	}

	public stop() {
		this.queue = [];
		this.currentlyPlaying = false;
		this.player.stop(true);
	}

	private async play() {
		if (this.queue.length == 0) {
			this.currentlyPlaying = false;
			this.channel?.send("The queue is empty");
			return;
		}
		const resource = createAudioResource(await downloadFile(this.queue[0].url));
		this.player.play(resource);
		this.player.on(AudioPlayerStatus.Idle, () => this.play());
		this.currentlyPlaying = true;
		this.channel?.send(`Now playing ${this.queue[0].name}`);
		this.queue.shift();
	}
}
