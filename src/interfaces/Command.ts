import { ApplicationCommandData } from "discord.js";

export default interface Command {
	run: Function;
	data: ApplicationCommandData;
}
