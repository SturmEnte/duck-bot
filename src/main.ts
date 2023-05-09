import "dotenv/config";
import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, Client, InteractionType } from "discord.js";
const client: Client = new Client({
	intents: ["GuildMembers"],
});
client.on("ready", () => {
	console.log("Logged in as", client.user?.tag);
});
client.login(process.env.TOKEN);
