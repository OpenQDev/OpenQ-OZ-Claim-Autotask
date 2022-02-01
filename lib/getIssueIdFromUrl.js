const axios = require('axios');
const GET_ISSUE_ID = require('./query/GET_ISSUE_ID');

const parseGitHubUrl = (githubUrl) => {
	let url;
	let pathArray = [];
	let githubData = [];

	try {
		url = new URL(githubUrl);
		pathArray = url.pathname.split('/');
	} catch (error) {
		return githubData;
	}
	// orgName
	githubData.push(pathArray[1]);

	// repoName
	githubData.push(pathArray[2]);

	// issueId
	githubData.push(parseInt(pathArray[4]));

	return githubData;
};

const getIssueIdFromUrl = async (issueUrl, token) => {
	let pathArray = parseGitHubUrl(issueUrl);
	const [orgName, repoName, issueNumber] = pathArray;

	return new Promise(async (resolve, reject) => {
		try {
			const result = await axios
				.post(
					'https://api.github.com/graphql',
					{
						query: GET_ISSUE_ID,
						variables: { orgName, repoName, issueNumber },
					},
					{
						headers: {
							'Authorization': 'token ' + token,
						},
					}
				);
			if (result.data.errors && result.data.errors[0].type == 'NOT_FOUND') {
				reject({ type: 'NOT_FOUND', message: `No issue found with url ${issueUrl}.` });
			}
			resolve({ issueId: result.data.data.repository.issue.id, viewer: result.data.data.viewer.login });
		} catch (error) {
			reject(error);
		}
	});
};

module.exports = getIssueIdFromUrl;