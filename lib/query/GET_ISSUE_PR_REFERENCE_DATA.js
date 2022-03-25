// also getting the reviewer of the closed PR

const GET_ISSUE_PR_REFERENCE_DATA = `
query($issueUrl: URI!) {
  viewer {
    login
  }
  resource(url: $issueUrl) {
    ...on Issue {
      id
      repository {
        owner {
          login
        }
      }
      timelineItems(itemTypes: [CROSS_REFERENCED_EVENT], first: 250) {
        edges {
          node {
            ...on CrossReferencedEvent {
              source {
                ...on PullRequest {
                  __typename
                  body
                  comments(first: 100) {
                    edges {
                      node {
                        body
                      }
                    }
                  }
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
              target {
                ...on Issue {
                  number
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