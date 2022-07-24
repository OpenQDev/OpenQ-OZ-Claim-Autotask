const checkWithdrawalEligibilityImpl = require('./lib/checkWithdrawalEligibility');
const validateSignedOauthTokenImpl = require('./lib/validateSignedOauthToken');
const { BOUNTY_IS_CLAIMED } = require('./errors');
const ethers = require('ethers');

const main = async (
	event,
	contract,
	checkWithdrawalEligibility = checkWithdrawalEligibilityImpl,
	validateSignedOauthToken = validateSignedOauthTokenImpl
) => {
	return new Promise(async (resolve, reject) => {
		const { issueUrl, payoutAddress } = event.request.body;
		console.log(`Attempting claim on ${issueUrl} to ${payoutAddress}`);

		let oauthToken;
		try {
			oauthToken = await validateSignedOauthToken(payoutAddress, event);
		} catch (error) {
			return reject(error);
		}

		try {
			const { canWithdraw, issueId, claimantPullRequestUrl } = await checkWithdrawalEligibility(issueUrl, oauthToken, event.secrets.PAT);
			const issueIsOpen = await contract.bountyIsOpen(issueId);

			if (canWithdraw && issueIsOpen) {
				const options = { gasLimit: 3000000 };

				const abiCoder = new ethers.utils.AbiCoder;
				const abiEncodedParams = abiCoder.encode(['string', 'uint256'], [claimantPullRequestUrl, depositCount]);

				const txn = await contract.claimBounty(issueId, payoutAddress, abiEncodedParams, options);

				console.log(`Can withdraw. Transaction hash is ${txn.hash}. Claimant PR is ${claimantPullRequestUrl}`);
				resolve({ txnHash: txn.hash, issueId, claimantPullRequestUrl });
			} else {
				console.error(BOUNTY_IS_CLAIMED({ issueUrl, payoutAddress, claimantPullRequestUrl }));
				reject(BOUNTY_IS_CLAIMED({ issueUrl, payoutAddress, claimantPullRequestUrl }));
			}
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
};

module.exports = main;