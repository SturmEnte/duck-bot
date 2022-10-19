import QueueManger from "../manager/VoiceManager";

export default interface Global {
	voiceMangers: Map<string, QueueManger>;
}
