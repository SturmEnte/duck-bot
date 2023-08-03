import { Client } from "discord.js";
import express, { Application } from "express";
import path from "path";
import cookieParser from "cookie-parser";

import Token from "./models/Token";

import AccessTokenManager from "./utils/accessTokenManager";

import auth from "./web/auth";
import guilds from "./web/guilds";

let client: Client;
let app: Application = express();

const accessTokenManager: AccessTokenManager = new AccessTokenManager();

function setup(newClient: Client) {
	client = newClient;

	app.use(express.static(path.join(__dirname, "../", "public")));
	app.use(cookieParser());

	app.set("view engine", "ejs");

	app.use("/auth", auth);

	app.all("*", async (req, res, next) => {
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
				res.status(401).json({ error: "Invalid token", oauth2_url: process.env.OAUTH2_URL });
			} else {
				res.redirect(process.env.OAUTH2_URL);
			}

			return;
		}

		next();
	});

	app.use("/", guilds(client, accessTokenManager));

	app.all("*", (req, res) => {
		res.status(404).send("Not found");
	});

	app.listen(process.env.PORT, () => {
		console.log("Started web server");
	});
}

export default setup;
