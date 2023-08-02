import { Router } from "express";
import axios from "axios";
import { randomBytes } from "crypto";

import OAuth2 from "../models/OAuth2";
import Token from "../models/Token";

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

	if (!authResponse.data.refresh_token || !authResponse.data.access_token) {
		res.status(500).send("Authorization failed. Error: \n" + authResponse.data.error);
		console.log(authResponse.data);
		return;
	}

	const identifyReponse = await axios.get("https://discord.com/api/v10/users/@me", {
		headers: {
			Authorization: "Bearer " + authResponse.data.access_token,
		},
	});

	if (!identifyReponse.data.id) {
		res.status(500).send("Idendification failed. Error: \n" + identifyReponse.data.error);
		console.log(identifyReponse.data);
		return;
	}

	OAuth2.create({ refresh_token: authResponse.data.refresh_token, scope: authResponse.data.scope, user_id: identifyReponse.data.id });

	const token = randomBytes(20).toString();
	const token = randomBytes(20).toString("hex");

	await Token.create({ token, user_id: identifyReponse.data.id });

	res.cookie("token", token);
	res.redirect("/");
});

export default router;
