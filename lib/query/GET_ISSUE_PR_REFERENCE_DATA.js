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
      timelineItems(itemTypes: [CROSS_REFERENCED_EVENT], first: 10) {
        edges {
          node {
            ...on CrossReferencedEvent {
							createdAt
              source {
                ...on PullRequest {
                  __typename
                  bodyText
									mergedAt
									createdAt
                  userContentEdits(first: 10) {
                    edges {
                      node {
                        diff
                        updatedAt
                        createdAt
                        editedAt
                      }
                    }
                  }
                  comments(first: 10) {
                    edges {
                      node {
                        bodyText
                        id
                        userContentEdits(first: 10) {
                          edges {
                            node {
                              diff
                              updatedAt
                              createdAt
                              editedAt
                            }
                          }
                        }
                      }
                    }
                  }
                  merged
									mergedAt
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
                  id
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