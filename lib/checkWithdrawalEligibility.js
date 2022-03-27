const axios = require('axios');
const GET_ISSUE_CONNECTED_EVENTS = require('./query/GET_ISSUE_CONNECTED_EVENTS');
const getCurrentlyConnectedPullRequests = require('./getCurrentlyConnectedPullRequests');

const {
	GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES,
	ISSUE_DOES_NOT_EXIST,
	UNKNOWN_ERROR,
	NO_WITHDRAWABLE_PR_FOUND,
	NO_CONNECTED_PRS
} = require('../errors');

/***
 *  
 * Eligible to withdraw if and only if:
 
 * Issue-to-PR Link Requirements
 * ✅ CrossReferenceEvent connects the issue to a pull request which contains the following attributes:

 * Pull Request Target Requirements
 * ✅ merged == true : pull request has been merged
 * ✅ baseRepository.owner.login == issue.repository.owner.login  : merged into a repository owned by the issue creator

 * Authorship Requirements
 * ✅ pullRequest.author.login == viewer.login : pull request author is the current authenticated user making the Claim call from OpenQ
 
 * Comment/Body Time Requirements
 * ✅ pullRequest.body contains a Closes ## comment which was PRESENT AT TIME OF MERGE as determined by createdAt userContentEdits timestamps
 * OR
 * ✅ pullRequest.comments[].body contains a Closes ## comment which was PRESENT AT TIME OF MERGE as determined by createdAt and userContentEdits timestamps
 * 
 * First-to-Merge Tie Breaker
 * ✅ In the event there are multiple pull requests which meet the above criteria, the one with the earliest mergedAt attribute will be the only one eligible to withdraw
 * 
 * ***/
const checkWithdrawalEligibility = async (issueUrl, token) => {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await axios
				.post(
					'https://api.github.com/graphql',
					{
						query: GET_ISSUE_CONNECTED_EVENTS,
						variables: { issueUrl },
					},
					{
						headers: {
							'Authorization': 'token ' + token,
						},
					}
				);

			// GitHub's GraphQL API doesn't return a 404 if an issue is not found.
			// It returns a 200 with errors on the GraphQL response body
			if (result.data.errors && result.data.errors[0].type == 'NOT_FOUND') {
				return reject(ISSUE_DOES_NOT_EXIST({ issueUrl }));
			}

			const viewer = result.data.data.viewer.login;
			const issueId = result.data.data.resource.id;
			const timelineItems = result.data.data.resource.timelineItems.edges.map(node => node.node);

			const isPullRequest = (pullRequest) => { return pullRequest.__typename == 'PullRequest'; };

			let merged;
			let prAuthor;
			let claimantPRFound;

			// get CURRENTLY linked pull requests
			let linkedPRs = getCurrentlyConnectedPullRequests(timelineItems);

			for (let pullRequest of linkedPRs) {
				if (isPullRequest(pullRequest)) {
					merged = pullRequest.merged;
					prAuthor = pullRequest.author.login;

					let prIsMerged = merged;
					let viewerIsPRAuthor = viewer === prAuthor;

					// There may be many PR's linked
					// Claimant will be the first merged PR linked to the issue fitting these criteria
					if (!viewerIsPRAuthor || !prIsMerged) {
						continue;
					} else {
						claimantPRFound = pullRequest;
						break;
					}
				} else {
					continue;
				}
			}

			if (linkedPRs.length == 0) {
				return reject(NO_CONNECTED_PRS({ issueId }));
			}

			if (claimantPRFound == undefined) {
				const linkedPrUrls = linkedPRs.map(pr => pr.permalink);
				return reject(NO_WITHDRAWABLE_PR_FOUND({ issueId, linkedPRs: linkedPrUrls }));
			}

			// Since we break after finding a fitting PR, this will run if all goes well
			return resolve({ issueId, canWithdraw: true, type: 'SUCCESS', errorMessage: null });
		} catch (error) {
			if (error.response && error.response.status == 401) {
				return reject(GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES({ issueUrl }));
			}
			return reject(UNKNOWN_ERROR({ issueUrl, error }));
		}
	});
};

module.exports = checkWithdrawalEligibility;