import { Schema, model } from "mongoose";

export default model(
	"token",
	new Schema({
		user_id: {
			type: String,
			required: true,
		},
		token: {
			type: String,
			required: true,
		},
	})
);
