import { AudioPlayer, VoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import { CommandInteraction, TextBasedChannel } from "discord.js";
import { stream } from "got";

export default class QueueManger {
	public connection: VoiceConnection;
	public currentlyPlaying: boolean;
	public paused: boolean;

	private player: AudioPlayer;
	private channel: TextBasedChannel | undefined;
	private queue: Array<any>;

	constructor(interaction: CommandInteraction, connection: VoiceConnection) {
		this.player = createAudioPlayer();
		this.queue = [];
		this.connection = connection;
		this.currentlyPlaying = false;
		this.connection.subscribe(this.player);
		this.paused = false;

		interaction.guild?.channels.fetch(interaction.channelId).then((channel) => {
			if (channel != null && channel?.isTextBased()) this.channel = channel;
		});
	}

	public addToQueue(interaction: CommandInteraction) {
		if (interaction.options.get("file")) {
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
			return;
		}

		if (interaction.options.get("url")) {
			const url = interaction.options.get("url")?.value;
			this.queue.push({
				name: url,
				url,
			});

			if (!this.currentlyPlaying) this.play();

			interaction.reply(`Added ${url} to the queue`);
			return;
		}

		interaction.reply("Please enter either a file or a url to a file");
	}

	public stop() {
		this.queue = [];
		this.currentlyPlaying = false;
		this.player.stop(true);
	}

	public pause() {
		this.player.pause(true);
		this.paused = true;
	}

	public resume() {
		this.player.unpause();
		this.paused = false;
	}

	private async play() {
		if (this.paused == true) {
			this.resume();
			this.channel?.send("Resumed playing");
			return;
		}

		if (this.queue.length == 0) {
			this.currentlyPlaying = false;
			this.channel?.send("The queue is empty");
			return;
		}

		const resource = createAudioResource(stream(this.queue[0].url), { inlineVolume: true });
		this.player.play(resource);
		this.player.on(AudioPlayerStatus.Idle, () => this.play());
		this.currentlyPlaying = true;
		this.channel?.send(`Now playing ${this.queue[0].name}`);
		this.queue.shift();
	}
}
