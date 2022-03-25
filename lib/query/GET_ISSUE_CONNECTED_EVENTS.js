// also getting the reviewer of the closed PR

const GET_ISSUE_PR_REFERENCE_DATA = `
query($issueUrl: URI!) {
  viewer {
    login
  }
  resource(url: $issueUrl) {
    ...on Issue {
      id
      timelineItems(itemTypes: [CONNECTED_EVENT, DISCONNECTED_EVENT], first: 250) {
        edges {
          node {
            ...on ConnectedEvent {
              __typename
              createdAt
              subject {
                ...on PullRequest {
                  __typename
									id
                  merged
                  mergedAt
                  permalink
                  author {
                    login
                  }
                }
              }
            }
          	...on DisconnectedEvent {
              __typename
							createdAt
              subject {
                ...on PullRequest {
                  __typename
									id
                  merged
                  mergedAt
                  permalink
                  author {
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
`;

module.exports = GET_ISSUE_PR_REFERENCE_DATA;