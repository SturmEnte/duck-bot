import download from "download";
import { v4 as uuid } from "uuid";
import { join } from "path";

export default async function (url: string): Promise<string> {
	let path: string = join(__dirname, "../../cache/");
	let filename: string = `${uuid()}.mp3`;

	await download(url, path, { filename });

	return join(path, filename);
}
