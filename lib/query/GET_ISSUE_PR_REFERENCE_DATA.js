// also getting the reviewer of the closed PR

const GET_ISSUE_PR_REFERENCE_DATA = `query($orgName: String!, $repoName: String!, $issueNumber: Int!) {
  viewer {
    login
  }
  organization(login: $orgName) {
		login
    repository(name: $repoName) {
      issue(number: $issueNumber) {
        id
        repository {
          owner {
            login
          }
        }
        timelineItems(first: 250) {
          edges {
            node {
              ...on CrossReferencedEvent {
                source {
                  ...on PullRequest {
										__typename
                    merged
										url
                    author {
                      login
                    }
                    baseRepository {
                      owner {
                        login
                      }
                    }
                  }
                }
              }
            }
          }
        }   
      }
    }
  }
}`;

module.exports = GET_ISSUE_PR_REFERENCE_DATA;