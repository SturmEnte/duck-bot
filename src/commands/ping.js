module.exports.init = (g) => {};

module.exports.execute = (interaction) => {
	interaction.reply("Pong");
};

module.exports.command = {
	name: "ping",
	description: "Replies with Pong",
};
