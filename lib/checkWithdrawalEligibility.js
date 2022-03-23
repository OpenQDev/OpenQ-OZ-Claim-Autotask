// Local
const parseGitHubUrl = require('./parseGitHubUrl');
const getIssuePRReferenceData = require('./getIssuePRReferenceData');

const {
	GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES,
	ISSUE_DOES_NOT_EXIST,
	PR_NOT_MERGED,
	PR_NOT_AUTHORED_BY_USER,
	PR_NOT_MERGED_INTO_ORGANIZATION_REPOSITORY,
	UNKNOWN_ERROR
} = require('../errors');

const checkWithdrawalEligibility = async (issueUrl, oauthToken) => {
	return new Promise(async (resolve, reject) => {
		let pathArray = parseGitHubUrl(issueUrl);
		const [orgName, repoName, issueNumber] = pathArray;

		try {
			const {
				issueId,
				viewer,
				organization,
				merged,
				prAuthor,
				baseRepositoryOwner
			} = await getIssuePRReferenceData(orgName, repoName, issueNumber, oauthToken);

			let prIsMerged = merged;
			let viewerIsPRAuthor = viewer === prAuthor;
			let mergedIntoOwnerRepository = baseRepositoryOwner === organization;

			if (!prIsMerged) {
				return reject(PR_NOT_MERGED({ issueId }));
			}

			if (!viewerIsPRAuthor) {
				return reject(PR_NOT_AUTHORED_BY_USER({ issueId, issueUrl, viewer, prAuthor }));
			}

			if (!mergedIntoOwnerRepository) {
				return reject(PR_NOT_MERGED_INTO_ORGANIZATION_REPOSITORY({ issueId, issueUrl }));
			}

			resolve({ issueId, canWithdraw: true, type: 'SUCCESS', errorMessage: null });
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