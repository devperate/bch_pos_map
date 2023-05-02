import { listMerchants, addMerchant } from "../models/model.js";

async function _listMerchants(req, res) {
	const filters = JSON.parse(JSON.stringify(req.body));
	const merchants = listMerchants(filters);
	res.status(200).json(JSON.stringify(merchants));
	//res.send(allMerchants)
}

async function _addMerchant(req, res) {
	//console.log(req.body);
	try {
		const data = JSON.parse(JSON.stringify(req.body));
		const [status, hash, _data] = await addMerchant(data);

		if (status == "added") {
			res.status(200).json({ multihash: hash, status, _data });
		} else if (status == "error") {
			res.status(500).json({ error: "error adding the order" });
		}
	} catch (err) {
		console.log(err);
	}
}

async function _deleteMerchant(req, res){
	//await this.ourMapDatabase.del(req.params.id)

	res.send({ status: 'ok' });
}

async function _heartbeatMerchant(req, res){
	// NOTE: I'm not sure how we should do this exactly.
	//       The problem is that some merchants will want to use a HDKey for privacy which means a new address each time there is a transaction.
	//       If we track this in the database, these addresses/trransactions will be visible to ANYONE that wants to see it (big privacy risk).
	//       So, I feel like it's better that the Map Provider "vouches" for it and the other map services just trust the map service?
	//       Maybe there's some cool cryptographic trick we can do in future?
}

export { _listMerchants, _addMerchant, _deleteMerchant, _heartbeatMerchant };
