// Import dependencies available in the autotask environment
const { DefenderRelayProvider, DefenderRelaySigner } = require('defender-relay-client/lib/ethers');
const signedCookie = require('./cookie-decoder');

const OPENQ_ABI = [{"inputs":[{"internalType":"string","name":"_id","type":"string"},{"internalType":"address","name":"_payoutAddress","type":"address"}],"name":"claimBounty","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"string","name":"_id","type":"string"}],"name":"bountyIsOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}]

// Helper methods
const checkWithdrawalEligibility = require('./lib/check-withdrawal-eligibility');
const { getIssueCloser } = require('./lib/check-withdrawal-eligibility');
const getIssueIdFromUrl = require('./lib/issueUrlToId');

exports.main = async (event, contract) => {
	let promise = new Promise(async (resolve, reject) => {
		// Extract issueId and payoutAddress from Body
		// Extract signed GitHub OAuth Token from X-Authorization Header
		const { issueUrl, payoutAddress } = event.request.body;
		const signedOAuthToken = event.request.headers['X-Authorization'];

		// Validate and decode the signed GitHub OAuth Token
		const oauthToken = signedCookie(signedOAuthToken, event.secrets.COOKIE_SIGNING_ENTROPY)

		// Return a 401 if no OAuth Token is present or if it is invalid
		if (typeof oauthToken == 'undefined' || oauthToken == false) {
			reject({ level: 'error', id: payoutAddress, canWithdraw: false, type: 'NO_GITHUB_OAUTH_TOKEN', message: 'No GitHub OAuth token. You must sign in.' });
		}

		// Otherwise, check withdrawl eligibility for the caller
		try {
			const { issueId, canWithdraw, type, message } = await checkWithdrawalEligibility(issueUrl, oauthToken)
			const issueIsOpen = await contract.bountyIsOpen(issueId);
			const { viewer } = await getIssueIdFromUrl(issueUrl, oauthToken);

			if (issueIsOpen) {
				// We only ever arrive in this codeblock if the caller is the closer
				// Otherwise, an error would have been thrown
				const options = { gasLimit: 3000000 };
				const txn = await contract.claimBounty(issueId, payoutAddress, options);
				console.log(`Called claimBounty in ${txn.hash}`);
				resolve({ txnHash: txn.hash, issueId });
			} else {
				// If the issue is closed, then return the closer
				const closer = await getIssueCloser(issueId, oauthToken);
				reject({ level: 'error', canWithdraw: false, id: payoutAddress, type: 'ISSUE_IS_CLAIMED', message: `The issue you are attempting to claim as ${viewer} at url ${issueUrl} has already been closed by ${closer} and sent to the address ${payoutAddress}.` });
			}
		} catch (error) {
				reject({ level: 'error', id: payoutAddress, type: error.type, message: error.message, canWithdraw: false });
		}
		})
	return promise;
}

// Entrypoint for the Autotask
exports.handler = async (event) => {
	console.log({ level: 'trace', id: payoutAddress, message: `${payoutAddress} attempting to withdraw issue at ${issueUrl}` });
	
	// Initialize Defender Relay Signer
  const provider = new DefenderRelayProvider(event);
  const signer = new DefenderRelaySigner(event, provider, { speed: 'fastest' });

	// Prepare OpenQ Contract for call
	const OPENQ_ADDRESS = event.secrets.OPENQ_ADDRESS;
  const openQ = new ethers.Contract(OPENQ_ADDRESS, OPENQ_ABI, signer);

	// We then run the main logic in the main function
	const result = await exports.main(event, openQ);
	return result;
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
	const express = require('express');
	const { ethers } = require('ethers');
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
				COOKIE_SIGNING_ENTROPY: process.env.COOKIE_SIGNING_ENTROPY,
				OPENQ_ADDRESS: process.env.OPENQ_ADDRESS
			},
			apiKey,
			apiSecret,
		}

		try {
			const result = await exports.main(event, contractWithWallet)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	})

	app.use((error, req, res, next) => {
		res.status(401).json(error)
	})

	const PORT = 8070;
	app.listen(PORT);
	console.log(`Open Zeppelin Autotask listening on ${PORT}`);
}