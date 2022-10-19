import QueueManger from "../manager/VoiceManager";

export default interface Global {
	queueMangers: Map<string, QueueManger>;
}
