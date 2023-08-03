import { Client } from "discord.js";
import express, { Application } from "express";

import cookieParser from "cookie-parser";

import Token from "./models/Token";

import accessTokenManager from "./utils/accessTokenManager";
import getUserInfo from "./utils/getUserInfo";
import getUserGuilds from "./utils/getUserGuilds";

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
			res.status(401).json({ error: "Invalid token" });
		} else {
			res.redirect(process.env.OAUTH2_URL);
		}

		return;
	}

	next();
});

app.get("/", async (req, res) => {
	const user_id = (await Token.findOne({ token: req.cookies.token })).user_id;
	const access_token = await accessTokenManager.getToken(user_id).catch((err) => {
		console.log("Error while getting access token:\n", err);
	});

	if (!access_token) {
		res.status(500).send("Failed to get access token");
		return;
	}

	const userInfo = await getUserInfo(user_id, access_token);

	if (!userInfo) {
		res.status(500).send("Failed to get user info");
		return;
	}

	let guilds: Array<any> | undefined = await getUserGuilds(user_id, access_token);

	if (!guilds) {
		res.status(500).send("Failed to get guilds");
		return;
	}

	// Remove all guilds that the bot is not a member of
	guilds = guilds.filter((guild) => {
		if (client.guilds.cache.has(guild.id)) return true;
		return false;
	});

	// Remove all guilds that the user is not an administrator on
	guilds = guilds.filter((guild) => {
		if ((guild.permissions & 0x8) == 8) return true;
		console.log(guild.permissions);
		return false;
	});

	res.render("guilds", { guilds, user: userInfo });
});

app.all("*", (req, res) => {
	res.status(404).send("Not found");
});

export default setup;
