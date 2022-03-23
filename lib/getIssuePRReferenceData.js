const axios = require('axios');
const GET_ISSUE_PR_REFERENCE_DATA = require('./query/GET_ISSUE_PR_REFERENCE_DATA');

/** 
 * Can withdraw if
 * ✅ merged == true
 * ✅ baseRepository.owner.login == issue.repository.owner.login (merged into a repository owned by the issue creator)
 * ✅ PR author.login is the same as viewer.login (PR author is the current user OAuth'd on OpenQ)
 * ***/

const getIssuePRReferenceData = async (orgName, repoName, issueNumber, token) => {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await axios
				.post(
					'https://api.github.com/graphql',
					{
						query: GET_ISSUE_PR_REFERENCE_DATA,
						variables: { orgName, repoName, issueNumber },
					},
					{
						headers: {
							'Authorization': 'token ' + token,
						},
					}
				);

			const viewer = result.data.data.viewer.login;
			const organization = result.data.data.organization.login;
			const issueId = result.data.data.organization.repository.issue.id;
			const timelineItems = result.data.data.organization.repository.issue.timelineItems.edges;

			const isPullRequest = (timelineItem) => { return timelineItem.source != undefined && timelineItem.source.__typename == 'PullRequest'; };

			// Claimant will be the first merged PR linked to the issue fitting these criteria
			let pullRequest;
			let merged;
			let prAuthor;
			let baseRepositoryOwner;
			for (let timelineItem of timelineItems) {
				let node = timelineItem.node;
				if (isPullRequest(node)) {
					pullRequest = node.source;
					merged = pullRequest.merged;
					prAuthor = pullRequest.author.login;
					baseRepositoryOwner = pullRequest.baseRepository.owner.login;
				} else {
					continue;
				}
			}

			resolve({
				issueId,
				viewer,
				organization,
				merged,
				prAuthor,
				baseRepositoryOwner
			});
		} catch (error) {
			reject(error);
		}
	});
};

module.exports = getIssuePRReferenceData;