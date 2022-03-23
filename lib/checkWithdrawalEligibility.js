// Third Party
const axios = require('axios');

// Local
const parseGitHubUrl = require('./parseGitHubUrl');
const getIssuePRReferenceData = require('./getIssuePRReferenceData');

const {
	NO_GITHUB_OAUTH_TOKEN,
	INVALID_GITHUB_OAUTH_TOKEN,
	GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES,
	ISSUE_DOES_NOT_EXIST,
	ISSUE_NOT_CLOSED,
	ISSUE_NOT_CLOSED_BY_PR,
	ISSUE_NOT_CLOSED_BY_USER,
	BOUNTY_IS_CLAIMED,
	UNKNOWN_ERROR
} = require('../errors');

const checkWithdrawalEligibility = async (issueUrl, oauthToken) => {
	return new Promise(async (resolve, reject) => {
		let pathArray = parseGitHubUrl(issueUrl);
		const [orgName, repoName, issueNumber] = pathArray;

		try {
			let response = await getIssuePRReferenceData(orgName, repoName, issueNumber, oauthToken);
			resolve(response);
		} catch (error) {
			if (error.type == 'NOT_FOUND') {
				return reject(ISSUE_DOES_NOT_EXIST({ issueUrl }));
			}
			if (error.response && error.response.status == 401) {
				return reject(GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES({ issueUrl }));
			}
			return reject(UNKNOWN_ERROR({ issueUrl, error }));
		}
	});
};

module.exports = checkWithdrawalEligibility;