const getCurrentlyConnectedPullRequests = require('../lib/getCurrentlyConnectedPullRequests');

describe('getCurrentlyConnectedPullRequests', () => {
	let oneConnectedPullRequestRequest = [{ __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:04:17Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } } }];
	let oneConnectedPullRequestResponse = [{ __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } }];

	let twoConnectedPullRequestsRequest = [{ __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:04:17Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } } }, { __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:04:17Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841PrM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/109', author: { login: 'FlacoJones' } } }];
	let twoConnectedPullRequestsResponse = [{ __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } }, { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841PrM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/109', author: { login: 'FlacoJones' } }];

	let oneConnectedPullRequestsLaterDisconnected = [{ __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:04:17Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } } }, { __typename: 'DisconnectedEvent', createdAt: '2022-03-25T19:04:21Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } } }];

	let connectedPullRequestsLaterDisconnectedThenReconnectedToOtherRequest = [{ __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:45:14Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CUu7', merged: false, mergedAt: null, permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/112', author: { login: 'FlacoJones' } } }, { __typename: 'DisconnectedEvent', createdAt: '2022-03-25T19:45:18Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CUu7', merged: false, mergedAt: null, permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/112', author: { login: 'FlacoJones' } } }, { __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:45:27Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841B631', merged: true, mergedAt: '2022-03-25T17:16:50Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/105', author: { login: 'FlacoJones' } } }];
	let connectedPullRequestsLaterDisconnectedThenReconnectedToOtherResponse = [{ __typename: 'PullRequest', id: 'PR_kwDOGWnnz841B631', merged: true, mergedAt: '2022-03-25T17:16:50Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/105', author: { login: 'FlacoJones' } }];

	it('returns empty array if given no events', () => {
		expect(getCurrentlyConnectedPullRequests([])).toEqual([]);
	});

	it('return connected pull request if there is one', () => {
		expect(getCurrentlyConnectedPullRequests(oneConnectedPullRequestRequest)).toEqual(oneConnectedPullRequestResponse);
	});

	it('returns two connected pull requests if there are two', () => {
		expect(getCurrentlyConnectedPullRequests(twoConnectedPullRequestsRequest)).toEqual(twoConnectedPullRequestsResponse);
	});

	it('returns no pull requests if one was connected but later disconnected', () => {
		expect(getCurrentlyConnectedPullRequests(oneConnectedPullRequestsLaterDisconnected)).toEqual([]);
	});

	it('returns the latest connected pull requests if one was connected then disconneceted, and later a different one was connected', () => {
		expect(getCurrentlyConnectedPullRequests(connectedPullRequestsLaterDisconnectedThenReconnectedToOtherRequest)).toEqual(connectedPullRequestsLaterDisconnectedThenReconnectedToOtherResponse);
	});
});