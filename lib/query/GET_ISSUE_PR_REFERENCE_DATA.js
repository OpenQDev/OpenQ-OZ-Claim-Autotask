// also getting the reviewer of the closed PR

const GET_ISSUE_PR_REFERENCE_DATA = `query($orgName: String!, $repoName: String!, $issueNumber: Int!) {
  viewer {
    login
  }
  organization(login: $orgName) {
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
                    merged
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