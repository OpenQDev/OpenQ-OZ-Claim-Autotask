const checkWithdrawalEligibilityImpl = require('./lib/checkWithdrawalEligibility');
const validateSignedOauthTokenImpl = require('./lib/validateSignedOauthToken');
const { BOUNTY_IS_CLAIMED } = require('./errors');

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
			const { canWithdraw, issueId } = await checkWithdrawalEligibility(issueUrl, oauthToken, event.secrets.PAT);
			const issueIsOpen = await contract.bountyIsOpen(issueId);

			if (canWithdraw && issueIsOpen) {
				const options = { gasLimit: 3000000 };
				const txn = await contract.claimBounty(issueId, payoutAddress, options);

				console.log(`Can withdraw. Transaction hash is ${txn.hash}`);
				resolve({ txnHash: txn.hash, issueId });
			} else {
				console.error(BOUNTY_IS_CLAIMED({ issueUrl, payoutAddress }));
				reject(BOUNTY_IS_CLAIMED({ issueUrl, payoutAddress }));
			}
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
};

module.exports = main;