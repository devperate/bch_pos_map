import * as dotenv from "dotenv";
dotenv.config();

import { app, start } from "./src/app.js";

const PORT = process.env.PORT || 8080;
const IS_MAP_PROVIDER = process.env.IS_MAP_PROVIDER || "";
const WHITELISTED_NODES_PUBK = process.env.WHITELISTED_NODES || "";
const ORBIT_DIRECTORY = process.env.ORBIT_DIRECTORY || "./orbitdb";

app.listen(PORT, () => {
	start(ORBIT_DIRECTORY, IS_MAP_PROVIDER, WHITELISTED_NODES_PUBK);
	console.log(`API listening on port ${PORT}...`);
});
