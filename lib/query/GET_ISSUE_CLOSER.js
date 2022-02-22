// also getting the reviewer of the closed PR

const GET_ISSUE_CLOSER = `query($issueId:ID!) {
    viewer {
      login
    }
    node(id: $issueId) {
      ... on Issue {
        body
        closed
        author {
          login
        }
        timelineItems(itemTypes: [CLOSED_EVENT], first: 10) {
          nodes {
            ... on ClosedEvent {
              closer {
                ... on PullRequest {
                  title
                  url
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
  }`;

module.exports = GET_ISSUE_CLOSER;