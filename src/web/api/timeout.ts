import { Router, json } from "express";
import { Client } from "discord.js";

import Token from "../../models/Token";

import AccessTokenManager from "../../utils/accessTokenManager";

let client: Client;
let accessTokenManager: AccessTokenManager;

const router = Router();

export default function init(newClient: Client, newAccessTokenManager: AccessTokenManager) {
	client = newClient;
	accessTokenManager = newAccessTokenManager;
	return router;
}

router.use(json());

router.post("/", async (req, res) => {
	if (!req.body.guild_id) {
		res.status(400).json({ error: "No guild id" });
	}

	if (!req.body.user_id) {
		res.status(400).json({ error: "No target user id" });
	}

	if (!req.body.duration) {
		res.status(400).json({ error: "No duration" });
	}

	const user_id = (await Token.findOne({ token: req.cookies.token })).user_id;

	try {
		await client.guilds.fetch(req.body.guild_id);
	} catch (error) {
		res.status(400).json({ error: "Guild not found" });
		console.log(error);
		return;
	}

	const guild = await client.guilds.fetch(req.body.guild_id);

	try {
		await guild.members.fetch(user_id);
	} catch (error) {
		res.status(400).json({ error: "You are not a member of that guild" });
		console.log(error);
		return;
	}

	try {
		await guild.members.fetch(req.body.user_id);
	} catch (error) {
		res.status(400).json({ error: "The target is not a member of that guild" });
		console.log(error);
		return;
	}

	const reqMember = await guild.members.fetch(user_id);
	const targetMember = await guild.members.fetch(req.body.user_id);

	if ((Number(reqMember.permissions.bitfield) & 8) != 8) {
		res.status(400).json({ error: "Not an admin" });
		return;
	}

	if ((Number(targetMember.permissions.bitfield) & 8) == 8) {
		res.status(400).json({ error: "Target is admin" });
		return;
	}

	await targetMember.timeout(req.body.duration);

	res.json({ msg: "Timeouted" });
});
