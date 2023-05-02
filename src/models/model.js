import { ourMapDatabase, trustedMapDatabases } from "../app.js";

function applyFilters(doc, filters) {
	if (filters.hasOwnProperty("co_ordinates")) {
		return () => doc.co_ordinates == filters.co_ordinates;
	}

	return true;
}

async function addMerchant(data) {
	//Jim's object reference to store
	// Get the merchant details from the request.
	const merchantDetails = {
		_id: Date.now(),
		name: req.body.name,
		// NOTE: We might end up with stable-coins on BCH eventually. So, I think an array might be useful here?
		currencies: ["BCH"],
		// TODO: Add other fields - co-ordinates, category, etc.
	};

	// TODO: Generate a UUID? Alternatively, maybe we set this to the position on our grid?
	// Not sure how this would work exactly though?
	const id = Date.now(); //replace by uuid of crypto library
	try {
		const hash = await ourMapDatabase.put({ _id: id, ...data });
		return ["added", hash, data];
	} catch (err) {
		return ["error"];
	}
}

function listMerchants(filters = "") {
	let allMerchants = [];

	// If we are a map provider...
	if (ourMapDatabase) {
		// Get merchants that belong to OUR database.
		// TODO: filter them based on co-ordinates given.
		allMerchants.push(
			...ourMapDatabase.query((doc) => applyFilters(doc, filters))
		); // doc.currencies.includes['BCH']))
	}

	// Iterate over our trusted databases.
	for (let trustedMapDatabase of Object.values(trustedMapDatabases)) {
		// Get merchants that belong to OTHER TRUSTED databases.
		// TODO: Filter them based on co-ordinates given.
		allMerchants.push(
			...trustedMapDatabase.query((doc) => applyFilters(doc, filters))
		); // doc.currencies.includes['BCH']))
	}

	return allMerchants;
}

export { listMerchants, addMerchant };
