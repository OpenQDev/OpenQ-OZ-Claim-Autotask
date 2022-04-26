// Helper methods
const main = require('./main');
const OPENQ_ABI = require('./OpenQABI.json');

// Autotask Entrypoint - constructs signer and contract using Relay
exports.handler = async (event) => {
	// Must change this secret name based on environment you are deploying to
	let OPENQ_PROXY_ADDRESS = event.secrets.OPENQ_PROXY_ADDRESS_PRODUCTION;
	const { DefenderRelayProvider, DefenderRelaySigner } = require('defender-relay-client/lib/ethers');
	const { ethers } = require('ethers');

	// Initialize Defender Relay Signer
	const provider = new DefenderRelayProvider(event);
	const signer = new DefenderRelaySigner(event, provider, { speed: 'fastest' });

	// Prepare OpenQ Contract for call
	const openQ = new ethers.Contract(OPENQ_PROXY_ADDRESS, OPENQ_ABI, signer);

	// We then run the main logic in the main function
	try {
		const result = await main(event, openQ);
		return result;
	} catch (error) {
		return error;
	}
};

// Local Provider + Contract Setup
if (require.main === module) {
	const app = require('./app');
	const PORT = 8070;
	app.listen(PORT);
	console.log(`Open Zeppelin Autotask listening on ${PORT}`);
}