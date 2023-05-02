import express from "express";
import cors from "cors";
import * as IPFS from "ipfs";
import OrbitDB from "orbit-db";
import Keystore from "orbit-db-keystore";
import OrbitDBIdentityProvider from "orbit-db-identity-provider";

import { router, loadAPIMapProviderRoutes } from "./routes/router.js";

const app = express();

app.use(cors(/*{origin: "http://localhost:8080"}*/));

app.use(express.json());

app.use(router);

var ourMapDatabase;
var trustedMapDatabases;

async function mapProvider(orbitInstance) {
	const ourAddress = await orbitInstance.determineAddress("maps", "docstore");

	try {
		console.log(`Attempting to open existing database: ${ourAddress}`);

		ourMapDatabase = await orbitInstance.open(
			`/orbitdb/${ourAddress.root}/${ourAddress.path}`,
			{
				type: "docstore",
				localOnly: true,
				overwrite: false,
			}
		);

		// Actually load the database.
		// NOTE: If we don't do this, our database will appear empty!
		await ourMapDatabase.load();

		await ourMapDatabase.put({
			_id: new Date().getTime(),
			name: "Test Merchant",
			currencies: ["BCH"],
		});
	} catch (error) {
		// And if we cannot open it, then create one...
		console.log(
			`Could not open existing database: ${error}. Creating new database.`
		);

		ourMapDatabase = await orbitInstance.create(`maps`, "docstore");
	}

	loadAPIMapProviderRoutes();

	// Log our ID so that we can send it other nodes.
	// TODO: Maybe we want an endpoint that provides this information?
	console.log(`Our address: ${ourMapDatabase.address.toString()}`);
}

async function checkingWhiteListedNodes(
	WHITELISTED_NODES_PUBK,
	trustedMapDatabases
) {
	const whitelistedNodePublicKeys =
		WHITELISTED_NODES_PUBK.split(",").filter(Boolean);

	// For each of our Whitelisted Node Public Keys, sync the OrbitDB databases.
	for (let whitelistedNodePublicKey of whitelistedNodePublicKeys) {
		console.log(`Syncing Node ${whitelistedNodePublicKey}`);

		// Open the database.
		// NOTE: OrbitDB will automagically keep these in sync and replicate the data locally. This is great for redundancy.
		const whitelistedDatabase = await this.orbitInstance.open(
			`/orbitdb/${whitelistedNodePublicKey}/maps`,
			{
				type: "docstore",
				overwrite: false,
			}
		);

		// Actually load the database.
		// NOTE: If we don't do this, the database will appear empty!
		await whitelistedDatabase.load();

		// Once the database has been successfully replicated, add it to our list of trusted map databases.
		whitelistedDatabase.events.once("replicated", () => {
			// Add this database to our list locally so that we can iterate it later.
			trustedMapDatabases[whitelistedNodePublicKey] = whitelistedDatabase;

			console.log(
				`Successfully synced database: ${whitelistedNodePublicKey}`
			);
		});
	}
}

async function start(ORBIT_DIRECTORY, IS_MAP_PROVIDER, WHITELISTED_NODES_PUBK) {
	// Load Keystore and Identity.
	// NOTE: We need to do this otherwise OrbitDB will hard-code the path to '.keystore' when creating it itself.
	// This means we would end up with a new key each time and would not be able to create multiple instances.
	const keystore = new Keystore(`${ORBIT_DIRECTORY}/keystore`);
	const identity = await OrbitDBIdentityProvider.createIdentity({
		id: "ourKey",
		keystore,
	});

	// Create an IPFS and OrbitDB instance.
	let ipfsInstance = await IPFS.create({
		repo: `${ORBIT_DIRECTORY}/ipfs`,
		start: true,
		EXPERIMENTAL: {
			pubsub: true,
		},
	});

	let orbitInstance = await OrbitDB.createInstance(ipfsInstance, {
		directory: ORBIT_DIRECTORY,
		identity,
		keystore,
	});

	if (IS_MAP_PROVIDER) {
		mapProvider(orbitInstance);
	}

	trustedMapDatabases = {};
	checkingWhiteListedNodes(WHITELISTED_NODES_PUBK, trustedMapDatabases);

	console.log("Service started");
}

export { app, start, ourMapDatabase, trustedMapDatabases };

// Listen for updates from peers
/*db.events.on("replicated", (address) => {
	console.log(db.iterator({ limit: -1 }).collect());
});*/
