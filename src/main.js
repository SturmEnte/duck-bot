require("dotenv/config");
require("colors");

const { Client } = require("discord.js");

const client = new Client({ intents: ["GuildVoiceStates"] });

client.on("ready", () => {
	console.log("Logged in as", client.user.tag.cyan);
});

client.login(process.env.TOKEN);
