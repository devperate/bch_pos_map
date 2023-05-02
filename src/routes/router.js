import express from "express";

import { _listMerchants, _addMerchant, _deleteMerchant, _heartbeatMerchant } from "./controller.js";

const router = express.Router();

router.get("/list", _listMerchants);

function loadAPIMapProviderRoutes() {
	// Register Express Endpoints for Merchant Registration and Heartbeats.
	// TODO: Can probably make this more "CRUDy" by using expressInstance.delete, etc.
	router.post('/add', _addMerchant);
	router.post('/delete', _deleteMerchant);
	router.post('/heartbeat', _heartbeatMerchant);
	
	console.log("map provider api endpoints loaded!");
}

export { router, loadAPIMapProviderRoutes };
