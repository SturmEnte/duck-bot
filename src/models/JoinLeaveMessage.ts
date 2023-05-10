import { Schema, model } from "mongoose";

export default model(
	"join-leave-message",
	new Schema({
		guild: {
			type: String,
			required: true,
		},
		channel: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
	})
);
