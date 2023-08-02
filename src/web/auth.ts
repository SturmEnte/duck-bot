import { Router } from "express";
import axios from "axios";
import { randomBytes } from "crypto";

import OAuth2 from "../models/OAuth2";

const router: Router = Router();

router.get("/", async (req, res) => {
	const code: string = String(req.query.code);

	if (!code) {
		res.status(400).send("No authorization code provided");
		return;
	}

	const body = new URLSearchParams();

	body.append("client_id", process.env.CLIENT_ID);
	body.append("client_secret", process.env.CLIENT_SECRET);
	body.append("grant_type", "authorization_code");
	body.append("code", code);
	body.append("redirect_uri", process.env.REDIRECT_URI);

	const authResponse = await axios.post("https://discord.com/api/v10/oauth2/token", body);

	if (!authResponse.data.refresh_token || !authResponse.data.access_token || authResponse.data.scope != "identify guilds") {
		res.status(500).send("Authorization failed");
		return;
	}

	const identifyReponse = await axios.get("https://discord.com/api/v10/users/@me", {
		headers: {
			Authorization: "Bearer " + authResponse.data.access_token,
		},
	});

	OAuth2.create({ refresh_token: authResponse.data.refresh_token, scope: authResponse.data.scope, user_id: identifyReponse.data.id });

	res.cookie("refresh_token", authResponse.data.refresh_token);
	res.redirect("/");
});

export default router;
