const axios = require('axios');
const GET_ISSUE_PR_REFERENCE_DATA = require('./query/GET_ISSUE_PR_REFERENCE_DATA');
const extractPullRequestAttributes = require('../lib/extractPullRequestAttributes');

const {
	GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES,
	ISSUE_DOES_NOT_EXIST,
	UNKNOWN_ERROR,
	NO_WITHDRAWABLE_PR_FOUND,
	NO_CONNECTED_PRS
} = require('../errors');
const extractIssueData = require('./extractIssueData');
const isPullRequest = require('./isPullRequest');
const contentAtMergeTime = require('./contentAtMergeTime');

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
						query: GET_ISSUE_PR_REFERENCE_DATA,
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

			const { viewer, issueId, issueRepositoryOwner, timelineItems, issueNumber } = extractIssueData(result);

			let referencedPrs = [];
			let claimantPRFound;

			for (let timelineItem of timelineItems) {
				if (isPullRequest(timelineItem)) {
					let pullRequest = timelineItem.source;
					referencedPrs.push(pullRequest);

					const { merged, prAuthor, baseRepositoryOwner, bodyText, bodyEdits, mergedAt, comments, pullRequestCreatedAt } = extractPullRequestAttributes(pullRequest);

					const textAtMergeTime = [];

					// Treat pull request body separately
					// Pass pullRequestCreatedAt date as replacement for body createdAt
					let bodyTextAtMergeTime = contentAtMergeTime(mergedAt, bodyText, bodyEdits, pullRequestCreatedAt);
					textAtMergeTime.push(bodyTextAtMergeTime);

					// Determine bodyText of all comments at merge time
					for (let comment of comments) {
						let commentEdits;
						if (commentEdits.edges.length > 0) {
							commentEdits = comment.userContentEdits.edges.map(node => node.node);
						} else {
							commentEdits = [];
						}
						console.log(commentEdits);
						const commentAtMergeTime = contentAtMergeTime(mergedAt, comment.bodyText, commentEdits, comment.createdAt);
						textAtMergeTime.push(commentAtMergeTime);
					}

					const allText = textAtMergeTime.join(' -DELIMITER_SYMBOL- ');
					console.log(allText);

					let prIsMerged = merged;
					let viewerIsPRAuthor = viewer === prAuthor;
					let baseRepositoryOwnerIsIssueOwner = baseRepositoryOwner === issueRepositoryOwner;
					let prDiscussionContainedIssueCloserCommentAtMergeTime = allText.includes(`Closes #${issueNumber}`);

					if (viewerIsPRAuthor && prIsMerged && baseRepositoryOwnerIsIssueOwner && prDiscussionContainedIssueCloserCommentAtMergeTime) {
						claimantPRFound = pullRequest;
						break;
					} else {
						// Onto the next one if the CrossReferenced pull request doesn't meet withdrawal criteria
						continue;
					}
				} else {
					// Onto the next timeline event if CrossReference didn't come from a pull request
					continue;
				}
			}

			if (referencedPrs.length == 0) {
				return reject(NO_CONNECTED_PRS({ issueId }));
			}

			if (claimantPRFound == undefined) {
				return reject(NO_WITHDRAWABLE_PR_FOUND({ issueId, linkedPRs: [] }));
			}

			// Since we break after finding a fitting PR, this will run if all goes well
			return resolve({ issueId, canWithdraw: true, type: 'SUCCESS', errorMessage: null });
		} catch (error) {
			console.error(error);
			if (error.response && error.response.status == 401) {
				return reject(GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES({ issueUrl }));
			}
			return reject(UNKNOWN_ERROR({ issueUrl, error }));
		}
	});
};

module.exports = checkWithdrawalEligibility;