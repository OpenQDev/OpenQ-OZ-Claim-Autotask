const GET_ISSUE_PR_REFERENCE_DATA = `
query($issueUrl: URI!) {
  viewer {
    login
  }
  resource(url: $issueUrl) {
    ...on Issue {
      id
			number
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
												createdAt
                        userContentEdits(first: 10) {
                          edges {
                            node {
                              diff
                              updatedAt
                              createdAt
                              editedAt
															deletedAt
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
                    name
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
}`;

module.exports = GET_ISSUE_PR_REFERENCE_DATA;