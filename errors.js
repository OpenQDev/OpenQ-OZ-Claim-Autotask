const INVALID_GITHUB_OAUTH_TOKEN = ({ payoutAddress }) => {
	return { level: 'error', id: payoutAddress, canWithdraw: false, type: 'INVALID_GITHUB_OAUTH_TOKEN', errorMessage: 'Invalid GitHub OAuth toke unsigned by OpenQ' };
};

const NO_GITHUB_OAUTH_TOKEN = ({ payoutAddress }) => {
	return { level: 'error', id: payoutAddress, canWithdraw: false, type: 'NO_GITHUB_OAUTH_TOKEN', errorMessage: 'No GitHub OAuth token. You must sign in.' };
};

module.exports = { NO_GITHUB_OAUTH_TOKEN, INVALID_GITHUB_OAUTH_TOKEN };