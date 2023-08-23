const curtain = document.getElementById("curtain");
const timeoutPopup = document.getElementById("timeout-popup");
const timeoutDuration = document.getElementById("timeout-duration");
const timeoutButton = document.getElementById("timeout-button");

let currentPopup = undefined;
let timeoutPopupData = {
	guildId: undefined,
	targetid: undefined,
};

curtain.onclick = () => {
	console.log("Click");
	switch (currentPopup) {
		case "timeout":
			timeoutPopup.style.display = "none";
			timeoutDuration.value = undefined;
		default:
			curtain.style.display = "none";
	}
};

function showTimeoutPopup(targetId) {
	console.log("Timeout");
	console.log("Target:", targetId);

	currentPopup = "timeout";

	curtain.style.display = "flex";
	timeoutPopup.style.display = "flex";

	const urlParts = location.href.split("/");

	if (location.href.endsWith("/")) {
		timeoutPopupData.guildId = urlParts[urlParts.length - 2];
	} else {
		timeoutPopupData.guildId = urlParts[urlParts.length - 1];
	}

	timeoutPopupData.targetid = targetId;
}

timeoutButton.onclick = () => {
	if (timeoutDuration.value <= 0) {
		alert("The timeout duration must be higher than 0");
		return;
	}

	timeoutButton.setAttribute("disabled", "");

	fetch("/api/timeout", {
		method: "post",
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			guild_id: timeoutPopupData.guildId,
			user_id: timeoutPopupData.targetid,
			duration: 10000,
		}),
	})
		.then(() => {
			timeoutPopup.style.display = "none";
			curtain.style.display = "none";
			timeoutButton.removeAttribute("disabled");
		})
		.catch((err) => {
			console.log(err);
			alert("Failed to timeout member");
			timeoutButton.removeAttribute("disabled");
		});
};

timeoutPopup.onclick = (event) => {
	event.stopPropagation();
};
