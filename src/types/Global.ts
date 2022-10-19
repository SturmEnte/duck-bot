import { VoiceConnection } from "@discordjs/voice";

import QueueManger from "../manager/QueueManager";

export default interface Global {
	connections: Map<string, VoiceConnection>;
	queueMangers: Map<string, QueueManger>;
}
