const axios = require('axios');
const GET_ISSUE_PR_REFERENCE_DATA = require('./query/GET_ISSUE_PR_REFERENCE_DATA');

const {
	GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES,
	ISSUE_DOES_NOT_EXIST,
	UNKNOWN_ERROR,
	NO_WITHDRAWABLE_PR_FOUND,
	NO_LINKED_PRS
} = require('../errors');

/** 
 * Eligible to withdraw if and only if:
 * ✅ merged == true
 * ✅ baseRepository.owner.login == issue.repository.owner.login (merged into a repository owned by the issue creator)
 * ✅ PR author.login is the same as viewer.login (PR author is the current user OAuth'd on OpenQ)
 * ✅ "Closes" comment must have been present on the PR before the time of merging
 * ✅ "Closes" comment must be for the same issue number as the bounty
 * ***/
const checkWithdrawalEligibility = async (issueUrl, token) => {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await axios
				.post(
					'https://api.github.com/graphql',
					{
						query: GET_ISSUE_PR_REFERENCE_DATA,
						variables: { issueUrl },
					},
					{
						headers: {
							'Authorization': 'token ' + token,
						},
					}
				);

			console.log(result.data);

			// GitHub's GraphQL API doesn't return a 404 if an issue is not found.
			// It returns a 200 with errors on the GraphQL response body
			if (result.data.errors && result.data.errors[0].type == 'NOT_FOUND') {
				return reject(ISSUE_DOES_NOT_EXIST({ issueUrl }));
			}

			const viewer = result.data.data.viewer.login;
			const organization = result.data.data.resource.repository.owner.login;
			const issueId = result.data.data.resource.id;
			const timelineItems = result.data.data.resource.timelineItems.edges;

			const isPullRequest = (timelineItem) => { return timelineItem.source != undefined && timelineItem.source.__typename == 'PullRequest'; };

			let pullRequest;
			let merged;
			let prAuthor;
			let baseRepositoryOwner;
			let claimantPRFound;
			let linkedPRs = [];

			for (let timelineItem of timelineItems) {
				let node = timelineItem.node;
				if (isPullRequest(node)) {
					pullRequest = node.source;
					merged = pullRequest.merged;
					prAuthor = pullRequest.author.login;
					baseRepositoryOwner = pullRequest.baseRepository.owner.login;

					let prIsMerged = merged;
					let viewerIsPRAuthor = viewer === prAuthor;
					let mergedIntoOwnerRepository = baseRepositoryOwner === organization;
					// add check for issue id in target is same as bounty id

					console.log('prIsMerged', prIsMerged);
					console.log('viewerIsPRAuthor', viewerIsPRAuthor);
					console.log('mergedIntoOwnerRepository', mergedIntoOwnerRepository);
					// There may be many PR's linked
					// Claimant will be the first merged PR linked to the issue fitting these criteria
					if (!mergedIntoOwnerRepository || !viewerIsPRAuthor || !prIsMerged) {
						linkedPRs.push(pullRequest.url);
						continue;
					} else {
						linkedPRs.push(pullRequest.url);
						claimantPRFound = pullRequest;
						break;
					}
				} else {
					continue;
				}
			}

			if (linkedPRs.length == 0) {
				return reject(NO_LINKED_PRS({ issueId }));
			}

			if (claimantPRFound == undefined) {
				return reject(NO_WITHDRAWABLE_PR_FOUND({ issueId, linkedPRs }));
			}

			// Since we break after finding a fitting PR, this will 
			return resolve({ issueId, canWithdraw: true, type: 'SUCCESS', errorMessage: null });
		} catch (error) {
			console.log(error);
			if (error.response && error.response.status == 401) {
				return reject(GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES({ issueUrl }));
			}
			return reject(UNKNOWN_ERROR({ issueUrl, error }));
		}
	});
};

module.exports = checkWithdrawalEligibility;