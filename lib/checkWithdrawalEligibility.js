// Third Party
const axios = require('axios');

// Local
const getIssueIdFromUrl = require('./getIssueIdFromUrl');
const getIssueClosedEvents = require('./getIssueClosedEvents');

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
		let issueId = '';

		// 1. Get Issue
		try {
			let response = await getIssueIdFromUrl(issueUrl, oauthToken);
			issueId = response.issueId;
		} catch (error) {
			if (error.type == 'NOT_FOUND') {
				return reject(ISSUE_DOES_NOT_EXIST({ issueUrl }));
			}
			if (error.response && error.response.status == 401) {
				return reject(GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES({ issueId }));
			}
			return reject({ canWithdraw: false, type: 'UNKNOWN_ERROR', message: JSON.stringify(error) });
		}

		// 2. Get Issue Timeline Events, filtering for CLOSED events
		try {
			let result = await getIssueClosedEvents(issueId, oauthToken);
			const data = result.data.data;
			const { node, viewer } = data;
			const viewerLogin = viewer.login;

			if (data.errors && data.errors[0].type == 'NOT_FOUND') {
				return reject(ISSUE_DOES_NOT_EXIST({ issueUrl }));
			}

			if (node.closed != true) {
				return reject(ISSUE_NOT_CLOSED({ issueId, issueUrl }));
			}

			if (node.timelineItems.nodes[0].closer == null) {
				return reject(ISSUE_NOT_CLOSED_BY_PR({ issueId, issueUrl }));
			}

			const closer = node.timelineItems.nodes[0].closer.author.login;

			const prUrl = node.timelineItems.nodes[0].closer.url;

			if (closer == viewerLogin) {
				return resolve(true);
			} else {
				return reject(ISSUE_NOT_CLOSED_BY_USER({ issueId, issueUrl, viewer: viewerLogin, closer, prUrl }));
			}
		} catch (error) {
			if (error.response && error.response.status == 401) {
				return reject(GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES({ issueId }));
			}
			return reject(UNKNOWN_ERROR({ issueId, error }));
		}
	});
};

module.exports = { checkWithdrawalEligibility };