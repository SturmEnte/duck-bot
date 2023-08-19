import { Router } from "express";
import { Client, GuildMember } from "discord.js";

import Token from "../models/Token";

import getUserInfo from "../utils/getUserInfo";
import getUserGuilds from "../utils/getUserGuilds";
import AccessTokenManager from "../utils/accessTokenManager";

let client: Client;
let accessTokenManager: AccessTokenManager;

const router = Router();

export default function init(newClient: Client, newAccessTokenManager: AccessTokenManager) {
	client = newClient;
	accessTokenManager = newAccessTokenManager;
	return router;
}

router.get("/:guildId", async (req, res) => {
	const user_id = (await Token.findOne({ token: req.cookies.token })).user_id;
	const access_token = await accessTokenManager.getToken(user_id).catch((err) => {
		console.log("Error while getting access token:\n", err);
	});

	if (!access_token) {
		res.render("error", { url: process.env.OAUTH2_URL, error: "Failed to get access token" });
		return;
	}

	const userInfo = await getUserInfo(user_id, access_token).catch((err) => {
		console.log("Error while getting user info: \n", err);
	});

	if (!userInfo) {
		res.render("error", { url: process.env.OAUTH2_URL, error: "Failed to get user info" });
		return;
	}

	console.log(req.params.guildId);

	const rawGuild = await client.guilds.fetch(req.params.guildId);

	const member = await rawGuild.members.fetch(user_id);

	if ((Number(member.permissions.bitfield) & 8) != 8) {
		res.render("error", { url: process.env.OAUTH2_URL, error: "Not an admin in this guild" });
		return;
	}

	let members = new Array<any>();

	(await rawGuild.members.fetch()).forEach((member) => {
		members.push({
			id: member.id,
			nickname: member.nickname,
			username: member.user.username,
			avatar: member.user.avatar,
			permissions: member.permissions.bitfield,
		});
	});

	let guild = {
		id: rawGuild.id,
		name: rawGuild.name,
		icon: rawGuild.icon,
		members: members,
	};

	res.render("guild", { guild, user: userInfo });
});
