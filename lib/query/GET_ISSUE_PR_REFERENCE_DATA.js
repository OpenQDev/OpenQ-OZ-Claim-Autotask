const GET_ISSUE_PR_REFERENCE_DATA = `
query($issueUrl: URI!) {
	resource(url: $issueUrl) {
    ...on Issue {
      id
			number
      repository {
        owner {
					id
          login
        }
      }
      timelineItems(itemTypes: [CROSS_REFERENCED_EVENT], first: 45) {
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
                  userContentEdits(first: 20) {
                    edges {
                      node {
                        diff
                        updatedAt
                        createdAt
                        editedAt
                      }
                    }
                  }
                  comments(first: 100) {
                    edges {
                      node {
                        bodyText
                        id
												createdAt
                        userContentEdits(first: 25) {
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
											id
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