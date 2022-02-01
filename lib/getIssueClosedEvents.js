const axios = require('axios');
const GET_ISSUE_CLOSER = require('./query/GET_ISSUE_CLOSER');

const getIssueClosedEvents = (issueId, oauthToken) => {
	return new Promise((resolve, reject) => {
		axios.post(
			'https://api.github.com/graphql',
			{
				query: GET_ISSUE_CLOSER,
				variables: { issueId },
			},
			{
				headers: {
					'Authorization': 'token ' + oauthToken,
				},
			}
		)
			.then(response => {
				resolve(response);
			}).catch(error => {
				reject(error);
			});
	});
};

module.exports = getIssueClosedEvents;