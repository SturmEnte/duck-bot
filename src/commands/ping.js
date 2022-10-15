module.exports.init = () => {};

module.exports.execute = (interaction) => {
	interaction.reply("Pong");
};

module.exports.command = {
	name: "ping",
	description: 'Replies with "Pong"',
};
