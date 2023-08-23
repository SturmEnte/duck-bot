function timeout(targetId) {
	console.log("Timeout");
	console.log("Target:", targetId);

	let guildId;
	const urlParts = location.href.split("/");

	if (location.href.endsWith("/")) {
		guildId = urlParts[urlParts.length - 2];
	} else {
		guildId = urlParts[urlParts.length - 1];
	}

	fetch("/api/timeout", {
		method: "post",
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			guild_id: guildId,
			user_id: targetId,
			duration: 10000,
		}),
	});
}
