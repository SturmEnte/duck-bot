import { Schema, model } from "mongoose";

export default model(
	"message-keeper",
	new Schema({
		guild: {
			type: String,
			required: true,
		},
		channel: {
			type: String,
			required: true,
		},
	})
);
