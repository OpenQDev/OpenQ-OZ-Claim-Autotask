const cookie = require('cookie-signature');
const { NO_GITHUB_OAUTH_TOKEN, INVALID_GITHUB_OAUTH_TOKEN, BOUNTY_IS_CLAIMED } = require('./errors');
const checkWithdrawalEligibilityImpl = require('./lib/checkWithdrawalEligibility');

const main = async (event, contract, checkWithdrawalEligibility = checkWithdrawalEligibilityImpl) => {
	return new Promise(async (resolve, reject) => {
		const { issueUrl, payoutAddress } = event.request.body;

		let signedOAuthToken;
		if (event.request.headers) {
			signedOAuthToken = event.request.headers['x-authorization'];
			if (!signedOAuthToken) {
				return reject(NO_GITHUB_OAUTH_TOKEN({ payoutAddress }));
			}
		} else {
			return reject(NO_GITHUB_OAUTH_TOKEN({ payoutAddress }));
		}

		const oauthToken = cookie.unsign(signedOAuthToken.slice(2), event.secrets.COOKIE_SIGNER);

		if (!oauthToken) {
			return reject(INVALID_GITHUB_OAUTH_TOKEN({ payoutAddress }));
		}

		try {
			const { canWithdraw, issueId } = await checkWithdrawalEligibility(issueUrl, oauthToken);
			const issueIsOpen = await contract.bountyIsOpen(issueId);

			if (issueIsOpen) {
				const options = { gasLimit: 3000000 };
				const txn = await contract.claimBounty(issueId, payoutAddress, options);
				resolve({ txnHash: txn.hash, issueId, txn });
			} else {
				reject(BOUNTY_IS_CLAIMED({ issueUrl, payoutAddress }));
			}
		} catch (error) {
			reject(error);
		}
	});
};

module.exports = main;