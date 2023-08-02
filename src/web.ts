import { Client } from "discord.js";
import express, { Application } from "express";
import cookieParser from "cookie-parser";

import Token from "./models/Token";

let client: Client;
let app: Application = express();

function setup(newClient: Client) {
	client = newClient;
	app.listen(process.env.PORT, () => {
		console.log("Started web server");
	});
}

import auth from "./web/auth";

app.use(cookieParser());

app.use("/auth", auth);

app.all("*", async (req, res, next) => {
	console.log(req.cookies);

	if (!req.cookies.token) {
		if (req.url.includes("api")) {
			res.status(401).json({ error: "No token" });
		} else {
			res.redirect(process.env.OAUTH2_URL);
		}

		return;
	}

	if (!(await Token.exists({ token: req.cookies.token }))) {
		if (req.url.includes("api")) {
			res.status(401).json({ error: "Invalid token" });
		} else {
			res.redirect(process.env.OAUTH2_URL);
		}

		return;
	}

	next();
});

app.all("*", (req, res) => {
	res.status(404).send("Not found");
});

export default setup;
