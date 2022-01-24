// Import dependencies available in the autotask environment
const { DefenderRelayProvider, DefenderRelaySigner } = require('defender-relay-client/lib/ethers');
const { ethers } = require('ethers');
const signedCookie = require('./cookie-decoder');

const OPENQ_ABI = [{"inputs":[{"internalType":"string","name":"_id","type":"string"},{"internalType":"address","name":"_payoutAddress","type":"address"}],"name":"claimBounty","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"string","name":"_id","type":"string"}],"name":"bountyIsOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}]

// Helper methods
const checkWithdrawalEligibility = require('./lib/check-withdrawal-eligibility');
const { getIssueCloser } = require('./lib/check-withdrawal-eligibility');
const getUserCanAssignAddress = require('./lib/check_user_owns_address');
const getIssueIdFromUrl = require('./lib/issueUrlToId');

// Entrypoint for the Autotask
exports.handler = async function(event) {
  // Extract issueId and payoutAddress from Body
	// Extract signed GitHub OAuth Token from X-Authorization Header
	const { issueUrl, payoutAddress } = event.request.body;
	const signedOAuthToken = event.request.headers['X-Authorization'];
	console.log(signedOAuthToken);

	console.log({ level: 'trace', id: payoutAddress, message: `${payoutAddress} attempting to withdraw issue at ${issueUrl}` });

	// Validate and decode the signed GitHub OAuth Token
	const oauthToken = signedCookie(signedOAuthToken, event.secrets.COOKIE_SIGNING_ENTROPY)
	console.log(`oauthToken ${oauthToken}`)
	// Initialize Defender Relay Signer
  const provider = new DefenderRelayProvider(event);
  const signer = new DefenderRelaySigner(event, provider, { speed: 'fastest' });

	// Prepare OpenQ Contract for call
	const OPENQ_ADDRESS = event.secrets.OPENQ_ADDRESS;
  const openQ = new ethers.Contract(OPENQ_ADDRESS, OPENQ_ABI, signer);

	// Return a 401 if no OAuth Token is present or if it is invalid
	if (typeof oauthToken == 'undefined' || oauthToken == false) {
		const error = { level: 'error', id: payoutAddress, canWithdraw: false, type: 'NO_GITHUB_OAUTH_TOKEN', message: 'No GitHub OAuth token. You must sign in.' };
		console.error(error);
		return res.status(401).json(error);
	}

	// Otherwise, check withdrawl eligibility for the caller
	await checkWithdrawalEligibility(issueUrl, oauthToken)
		.then(async result => {
			const { issueId, viewer } = await getIssueIdFromUrl(issueUrl, oauthToken);
			const issueIsOpen = await openQ.bountyIsOpen(issueId);

			if (issueIsOpen) {
				// We only ever arrive in this codeblock if the caller is the closer
				// Otherwise, an error would have been thrown
				const options = { gasLimit: 3000000 };
				const txn = await openQ.claimBounty(issueId, payoutAddress, options);
				console.log(`Called claimBounty in ${txn.hash}`);
				return { txn: txn.hash, issueId };
			} else {
				// If the issue is closed, then return the closer
				const closer = await getIssueCloser(issueId, oauthToken);
				const error = { level: 'error', canWithdraw: false, id: payoutAddress, type: 'ISSUE_IS_CLAIMED', message: `The issue you are attempting to claim as ${viewer} at url ${issueUrl} has already been closed by ${closer} and sent to the address ${payoutAddress}.` };
				console.error(error);
				res.status(401).json(error);
			}
		})
		.catch(e => {
			const error = { level: 'error', id: payoutAddress, type: e.type, message: e.message, canWithdraw: false };
			console.error(error);
			return res.status(401).json(error);
		});
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
  require('dotenv').config();
  const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env;
  exports.handler({ apiKey, apiSecret })
    .then(() => process.exit(0))
    .catch(error => { console.error(error); process.exit(1); });
}