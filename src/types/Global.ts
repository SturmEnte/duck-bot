import { VoiceConnection } from "@discordjs/voice";

export default interface Global {
	connection: Map<string, VoiceConnection>;
}
