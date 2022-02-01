const GET_ISSUE_CLOSER = require('./query/GET_ISSUE_CLOSER');

const getIssueCloser = (issueId, oauthToken) => {
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
				const closer = response.data.data.node.timelineItems.nodes[0].closer.author.login;
				resolve(closer);
			}).catch(error => {
				reject(error);
			});
	});
};

module.exports = getIssueCloser;