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
			const githubResponse = result.data.data;
			resolve(githubResponse);
		} catch (error) {
			reject(error);
		}
	});
};

module.exports = getIssuePRReferenceData;