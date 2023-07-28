import { Client } from "discord.js";
import express, { Application } from "express";

let client: Client;
let app: Application = express();

function setup(newClient: Client) {
	client = newClient;
	app.listen(process.env.PORT, () => {
		console.log("Started web server");
	});
}

app.get("*", (req, res) => {
	res.send(client.user.username);
});

export default setup;
