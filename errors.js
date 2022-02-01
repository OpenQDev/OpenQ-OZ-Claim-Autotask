const INVALID_GITHUB_OAUTH_TOKEN = ({ payoutAddress }) => {
	return { level: 'error', id: payoutAddress, canWithdraw: false, type: 'INVALID_GITHUB_OAUTH_TOKEN', errorMessage: 'Invalid GitHub OAuth toke unsigned by OpenQ' };
};

const NO_GITHUB_OAUTH_TOKEN = ({ payoutAddress }) => {
	return { level: 'error', id: payoutAddress, canWithdraw: false, type: 'NO_GITHUB_OAUTH_TOKEN', errorMessage: 'No GitHub OAuth token. You must sign in.' };
};

const GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES = ({ issueId }) => {
	return { issueId, canWithdraw: false, type: 'GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES', message: 'Your GitHub OAuth token is not authorized to access this resource' };
};

const ISSUE_DOES_NOT_EXIST = ({ issueUrl }) => {
	return { canWithdraw: false, type: 'NOT_FOUND', message: `No issue found with url ${issueUrl}` };
};

const ISSUE_NOT_CLOSED = ({ issueId, issueUrl }) => {
	return { issueId, canWithdraw: false, type: 'NOT_CLOSED', message: `The issue at ${issueUrl} is still open on GitHub.` };
};

const ISSUE_NOT_CLOSED_BY_PR = ({ issueId, issueUrl }) => {
	return { issueId, canWithdraw: false, type: 'ISSUE_NOT_CLOSED_BY_PR', message: 'Issue was not closed by a PR' };
};

const ISSUE_NOT_CLOSED_BY_USER = ({ issueId, issueUrl, viewer, closer, prUrl }) => {
	return { issueId, canWithdraw: false, type: 'ISSUE_NOT_CLOSED_BY_USER', message: `Issue with url ${issueUrl} was not closed by ${viewer}. It was closed by ${closer} in PR ${prUrl}.` };
};

const BOUNTY_IS_CLAIMED = ({ issueUrl, payoutAddress }) => {
	return { level: 'error', canWithdraw: false, id: payoutAddress, type: 'BOUNTY_IS_CLAIMED', message: `Bounty is already claimed` };
};

const UNKNOWN_ERROR = ({ issueId, error }) => {
	return { issueId, canWithdraw: false, type: 'UNKNOWN_ERROR', message: error };
};

module.exports = {
	NO_GITHUB_OAUTH_TOKEN,
	INVALID_GITHUB_OAUTH_TOKEN,
	ISSUE_DOES_NOT_EXIST,
	ISSUE_NOT_CLOSED,
	ISSUE_NOT_CLOSED_BY_PR,
	ISSUE_NOT_CLOSED_BY_USER,
	BOUNTY_IS_CLAIMED,
	UNKNOWN_ERROR,
	GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES
};