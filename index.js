// Import dependencies available in the autotask environment

// Helper methods
const main = require('./main');
const checkWithdrawalEligibility = require('./lib/checkWithdrawalEligibility');
const OPENQ_ABI = require('./OpenQABI.json');

// Autotask Entrypoint - constructs signer and contract using Relay
exports.handler = async (event) => {
	const { DefenderRelayProvider, DefenderRelaySigner } = require('defender-relay-client/lib/ethers');
	// Initialize Defender Relay Signer
	const provider = new DefenderRelayProvider(event);
	const signer = new DefenderRelaySigner(event, provider, { speed: 'fastest' });

	// Prepare OpenQ Contract for call
	const OPENQ_ADDRESS = event.secrets.OPENQ_ADDRESS;
	const openQ = new ethers.Contract(OPENQ_ADDRESS, OPENQ_ABI, signer);

	// We then run the main logic in the main function
	return await main(event, openQ);
};

// Local Provider + Contract Setup
if (require.main === module) {
	const express = require('express');
	const ethers = require('ethers');
	require('dotenv').config();

	const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env;
	const app = express();
	app.use(express.json());

	app.post('/', async (req, res, next) => {
		// Construct local signer
		const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
		const contract = new ethers.Contract(process.env.OPENQ_ADDRESS, OPENQ_ABI, provider);
		const wallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);
		const contractWithWallet = contract.connect(wallet);

		// Prepare data for event
		const { issueUrl, payoutAddress } = req.body;
		const signedOAuthToken = req.headers['x-authorization'];

		// Construct event
		const event = {
			request: {
				body: {
					issueUrl,
					payoutAddress
				},
				headers: {
					'X-Authorization': signedOAuthToken
				}
			},
			secrets: {
				COOKIE_SIGNER: process.env.COOKIE_SIGNER,
				OPENQ_ADDRESS: process.env.OPENQ_ADDRESS
			},
			apiKey,
			apiSecret,
		};

		try {
			const result = await main(event, contractWithWallet);
			res.status(200).json(result);
		} catch (error) {
			console.log(error);
			res.status(500).json(error);
		}
	});

	const PORT = 8070;
	app.listen(PORT);
	console.log(`Open Zeppelin Autotask listening on ${PORT}`);
}