const GET_ISSUE_ID = `query ($orgName: String!, $repoName: String!, $issueNumber: Int!) {
	viewer {
		login
	}  
	repository(owner: $orgName, name: $repoName) {
			issue(number: $issueNumber) {
				id
			}
		}
	}`;

module.exports = GET_ISSUE_ID;