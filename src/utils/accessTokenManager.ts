import axios from "axios";

import OAuth2 from "../models/OAuth2";

const accessTokens = new Map<string, { token: string; expires: number }>();

async function getToken(user_id: string) {
	if (accessTokens.has(user_id) && accessTokens.get(user_id).expires + 1000 < Date.now()) {
		return accessTokens.get(user_id);
	}

	const refreshToken = (await OAuth2.findOne({ user_id: user_id })).refresh_token;

	const body = new URLSearchParams();

	body.append("client_id", process.env.CLIENT_ID);
	body.append("client_secret", process.env.CLIENT_SECRET);
	body.append("grant_type", "refresh_token");
	body.append("refresh_token", refreshToken);

	const authResponse = await axios.post("https://discord.com/api/v10/oauth2/token", body);

	if (!authResponse.data.refresh_token || !authResponse.data.access_token) {
		console.log(authResponse.data);
		return;
	}

	accessTokens.set(user_id, { token: authResponse.data.access_token, expires: Date.now() + authResponse.data.expires_in });

	await OAuth2.findOneAndUpdate({ user_id: user_id }, { refresh_token: authResponse.data.refresh_token });

	return authResponse.data.access_token;
}

export default {
	getToken,
};
