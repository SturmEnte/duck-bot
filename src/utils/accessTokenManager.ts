import axios from "axios";

import OAuth2 from "../models/OAuth2";

export default class {
	accessTokens = new Map<string, { token: string; expires: number }>();

	async getToken(userId: string): Promise<string | undefined> {
		if (this.accessTokens.has(userId) && this.accessTokens.get(userId).expires + 1000 < Date.now()) {
			return this.accessTokens.get(userId).token;
		}

		const refreshToken = (await OAuth2.findOne({ user_id: userId })).refresh_token;

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

		this.accessTokens.set(userId, { token: authResponse.data.access_token, expires: Date.now() + authResponse.data.expires_in });

		await OAuth2.findOneAndUpdate({ user_id: userId }, { refresh_token: authResponse.data.refresh_token });

		return authResponse.data.access_token;
	}
}
