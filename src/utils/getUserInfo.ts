import axios from "axios";

export default async function getUserInfo(user_id: string, access_token: string) {
	const userInfoResponse = await axios.get("https://discord.com/api/v10/users/@me", {
		headers: {
			Authorization: "Bearer " + access_token,
		},
	});

	if (!userInfoResponse.data.username) {
		return;
	}

	return userInfoResponse.data;
}
