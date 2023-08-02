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

import auth from "./web/auth";

app.use("/auth", auth);

app.get("*", (req, res) => {
	res.send(client.user.username);
});

export default setup;
