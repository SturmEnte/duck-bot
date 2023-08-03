import axios from "axios";

export default async function getUserGuilds(user_id: string, access_token: string) {
	const guildsResponse = await axios.get("https://discord.com/api/v10/users/@me/guilds", {
		headers: {
			Authorization: "Bearer " + access_token,
		},
	});

	if (!guildsResponse.data.length) {
		return;
	}

	return guildsResponse.data;
}
