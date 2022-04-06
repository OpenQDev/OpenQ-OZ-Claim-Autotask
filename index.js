// Helper methods
const main = require('./main');
const ethers = require('ethers');

const OPENQ_ABI = require('./OpenQABI.json');

// Autotask Entrypoint - constructs signer and contract using Relay
exports.handler = async (event) => {
	// Must change this secret name based on environment you are deploying to
	let OPENQ_ADDRESS = event.secrets.OPENQ_ADDRESS;
	const { DefenderRelayProvider, DefenderRelaySigner } = require('defender-relay-client/lib/ethers');
	const { ethers } = require('ethers');

	// Initialize Defender Relay Signer
	const provider = new DefenderRelayProvider(event);
	const signer = new DefenderRelaySigner(event, provider, { speed: 'fastest' });

	// Prepare OpenQ Contract for call
	const openQ = new ethers.Contract(OPENQ_ADDRESS, OPENQ_ABI, signer);

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
	const express = require('express');
	require('dotenv').config();

	const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env;
	const app = express();
	app.use(express.json());

	app.post('/', async (req, res) => {
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
					'x-authorization': signedOAuthToken
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

			// On local we mimic the return JSON from OpenZeppelin Autotask
			// The result in production is stringidied, so we do that here
			// https://docs.openzeppelin.com/defender/autotasks#webhook-handler
			const autotaskResult = {
				'autotaskRunId': '37a91eba-9a6a-4404-95e4-38d178ba69ed',
				'autotaskId': '19ef0257-bba4-4723-a18f-67d96726213e',
				'trigger': 'webhook',
				'status': 'success',
				'createdAt': '2021-02-23T18:49:14.812Z',
				'encodedLogs': 'U1RBU...cwkK',
				'result': JSON.stringify(result),
				'requestId': 'e7979150-44d3-4021-926c-9d9679788eb8'
			};

			res.status(200).send(autotaskResult);
		} catch (error) {
			res.status(500).json(error);
		}
	});

	const PORT = 8070;
	app.listen(PORT);
	console.log(`Open Zeppelin Autotask listening on ${PORT}`);
}