const getCurrentlyConnectedPullRequests = require('../lib/getCurrentlyConnectedPullRequests');

describe('getCurrentlyConnectedPullRequests', () => {
	let oneConnectedPullRequestRequest = [{ node: { __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:04:17Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } } } }];
	let oneConnectedPullRequestResponse = [{ __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } }];

	let twoConnectedPullRequestsRequest = [{ node: { __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:04:17Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } } } }, { node: { __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:04:17Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841PrM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/109', author: { login: 'FlacoJones' } } } }];
	let twoConnectedPullRequestsResponse = [{ __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } }, { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841PrM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/109', author: { login: 'FlacoJones' } }];

	let oneConnectedPullRequestsLaterDisconnected = [{ node: { __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:04:17Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } } } }, { node: { __typename: 'DisconnectedEvent', createdAt: '2022-03-25T19:04:21Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } } } }];

	it.only('return connected pull request if there is one', () => {
		expect(getCurrentlyConnectedPullRequests(oneConnectedPullRequestRequest)).toEqual(oneConnectedPullRequestResponse);
	});

	it('returns two connected pull requests if there are two', () => {
		expect(getCurrentlyConnectedPullRequests(twoConnectedPullRequestsRequest)).toEqual(twoConnectedPullRequestsResponse);
	});

	it('returns no pull requests if one was connected but later disconnected', () => {
		expect(getCurrentlyConnectedPullRequests(oneConnectedPullRequestsLaterDisconnected)).toEqual([]);
	});
});