const getIssueIdFromUrl = require('./lib/issueUrlToId');
const signedCookie = require('./cookie-decoder');

const main = async (event, contract) => {
	let promise = new Promise(async (resolve, reject) => {
		// Extract issueId and payoutAddress from Body
		// Extract signed GitHub OAuth Token from X-Authorization Header
		const { issueUrl, payoutAddress } = event.request.body;

		console.log({ level: 'trace', id: payoutAddress, message: `${payoutAddress} attempting to withdraw issue at ${issueUrl}` });

		const signedOAuthToken = event.request.headers['X-Authorization'];

		// Validate and decode the signed GitHub OAuth Token
		const oauthToken = signedCookie(signedOAuthToken, event.secrets.COOKIE_SIGNING_ENTROPY);

		// Return a 401 if no OAuth Token is present or if it is invalid
		if (typeof oauthToken == 'undefined' || oauthToken == false) {
			reject({ level: 'error', id: payoutAddress, canWithdraw: false, type: 'NO_GITHUB_OAUTH_TOKEN', message: 'No GitHub OAuth token. You must sign in.' });
		}

		// Otherwise, check withdrawl eligibility for the caller
		try {
			const { issueId, canWithdraw, type, message } = await checkWithdrawalEligibility(issueUrl, oauthToken);
			const issueIsOpen = await contract.bountyIsOpen(issueId);
			const { viewer } = await getIssueIdFromUrl(issueUrl, oauthToken);

			if (issueIsOpen) {
				// We only ever arrive in this codeblock if the caller is the closer
				// Otherwise, an error would have been thrown
				const options = { gasLimit: 3000000 };
				const txn = await contract.claimBounty(issueId, payoutAddress, options);
				console.log('claimBounty txn', txn);
				resolve({ txnHash: txn.hash, issueId });
			} else {
				// If the issue is closed, then return the closer
				const closer = await getIssueCloser(issueId, oauthToken);
				reject({ level: 'error', canWithdraw: false, id: payoutAddress, type: 'ISSUE_IS_CLAIMED', message: `The issue you are attempting to claim as ${viewer} at url ${issueUrl} has already been closed by ${closer} and sent to the address ${payoutAddress}.` });
			}
		} catch (error) {
			reject({ level: 'error', id: payoutAddress, type: error.type, message: error.message, canWithdraw: false });
		}
	});
	return promise;
};

module.exports = main;