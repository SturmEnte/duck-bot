import { Schema, model } from "mongoose";

export default model(
	"oauth2",
	new Schema({
		refresh_token: {
			type: String,
			required: true,
		},
		scope: {
			type: String,
			required: true,
		},
		user_id: {
			type: String,
			required: true,
		},
	})
);
