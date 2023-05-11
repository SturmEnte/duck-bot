import { Schema, model } from "mongoose";

export default model(
	"silent-ban",
	new Schema({
		guild: {
			type: String,
			required: true,
		},
		user: {
			type: String,
			required: true,
		},
		bannedBy: {
			type: String,
			required: true,
		},
		bannedAt: {
			type: Date,
			required: true,
		},
	})
);
