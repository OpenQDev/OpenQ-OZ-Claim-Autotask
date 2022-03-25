const checkWithdrawalEligibility = require('../lib/checkWithdrawalEligibility');
const {
	ISSUE_DOES_NOT_EXIST,
	GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES
} = require('../errors');

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

describe('checkWithdrawalEligibility', () => {
	let issueUrl = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/42';

	/* Example Issues
	connectedMergedPullRequest = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/115';
	noConnectedPullRequests = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/110';
	connectedUnmergedPullRequest = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/111';
	connectedThenDisconnectedPullRequest = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/113';
	connectedMergedbyalo9507 = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/119'
	*/

	let oauthToken = 'oAuthToken';
	let mock;

	beforeAll(() => {
		mock = new MockAdapter(axios);
	});

	beforeEach(() => {
		mock.reset();
	});

	describe('checkWithdrawalEligibility Pre-Requisites', () => {
		it('should reject with ISSUE_DOES_NOT_EXIST error if issue is not found', async () => {
			const data = { errors: [{ type: 'NOT_FOUND' }] };
			mock.onPost('https://api.github.com/graphql').reply(200, data);
			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual(ISSUE_DOES_NOT_EXIST({ issueUrl }));
		});

		it('should reject with GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES error if GitHub returns a 401', async () => {
			mock.onPost('https://api.github.com/graphql').reply(401);
			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual(GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES({ issueUrl }));
		});
	});

	describe('Correctly verifies withdrawal eligibility based on PR-to-issue connection, merge, and PR author', () => {
		it('should resolve with NO_CONNECTED_PRS if none are connected', async () => {
			const issuePrData = { data: { viewer: { login: 'FlacoJones' }, resource: { id: 'I_kwDOGWnnz85GZu4Y', timelineItems: { edges: [] } } } };

			mock
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, issuePrData);

			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual({ canWithdraw: false, errorMessage: 'There are no pull requests linked to this issue.', issueId: 'I_kwDOGWnnz85GZu4Y', type: 'NO_CONNECTED_PRS' });
		});

		it('should resolve with NO_CONNECTED_PRS if one is connected then disconnected', async () => {
			const issuePrData = { data: { viewer: { login: 'FlacoJones' }, resource: { id: 'I_kwDOGWnnz85GZwIh', timelineItems: { edges: [{ node: { __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:04:17Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } } } }, { node: { __typename: 'DisconnectedEvent', createdAt: '2022-03-25T19:04:21Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CPM1', merged: true, mergedAt: '2022-03-25T18:49:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/108', author: { login: 'FlacoJones' } } } }] } } } };

			mock
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, issuePrData);

			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual({ canWithdraw: false, errorMessage: 'There are no pull requests linked to this issue.', issueId: 'I_kwDOGWnnz85GZwIh', type: 'NO_CONNECTED_PRS' });
		});

		it('should resolve with NO_WITHDRAWABLE_PR_FOUND if Pull Request is connected but not yet merged', async () => {
			const issuePrData = { data: { viewer: { login: 'FlacoJones' }, resource: { id: 'I_kwDOGWnnz85GZvCc', timelineItems: { edges: [{ node: { __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:02:01Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CUu7', merged: false, mergedAt: null, permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/112', author: { login: 'FlacoJones' } } } }] } } } };

			mock
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, issuePrData);

			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual({ canWithdraw: false, errorMessage: 'No withdrawable PR found.  In order for a PR to qualify for claim it needs to be connected to the issue by a maintainer and merged by YOU. We found the following linked pull requests that do not meet the above criteria: https://github.com/OpenQDev/OpenQ-TestRepo/pull/112', issueId: 'I_kwDOGWnnz85GZvCc', type: 'NO_WITHDRAWABLE_PR_FOUND' });
		});

		it('should resolve with NO_WITHDRAWABLE_PR_FOUND if Pull Request is connected and merged but not authored by viewer', async () => {
			const issuePrData = { data: { viewer: { login: 'FlacoJones' }, resource: { id: 'I_kwDOGWnnz85GaLcH', timelineItems: { edges: [{ node: { __typename: 'ConnectedEvent', createdAt: '2022-03-25T21:05:31Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841CuEK', merged: true, mergedAt: '2022-03-25T21:05:38Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/120', author: { login: 'alo9507' } } } }] } } } };

			mock
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, issuePrData);

			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual({ canWithdraw: false, errorMessage: 'No withdrawable PR found.  In order for a PR to qualify for claim it needs to be connected to the issue by a maintainer and merged by YOU. We found the following linked pull requests that do not meet the above criteria: https://github.com/OpenQDev/OpenQ-TestRepo/pull/120', issueId: 'I_kwDOGWnnz85GaLcH', type: 'NO_WITHDRAWABLE_PR_FOUND' });
		});

		it('should resolve to with canWithdraw: true if issue was connected to a closed PR authored by the viewer - single pull request once-connected', async () => {
			const issuePrData = { data: { viewer: { login: 'FlacoJones' }, resource: { id: 'I_kwDOGWnnz85GZ9JL', timelineItems: { edges: [{ node: { __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:50:51Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841Chat', merged: true, mergedAt: '2022-03-25T19:51:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/116', author: { login: 'FlacoJones' } } } }] } } } };

			mock
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, issuePrData);

			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).resolves.toEqual({ 'canWithdraw': true, type: 'SUCCESS', issueId: 'I_kwDOGWnnz85GZ9JL', errorMessage: null });
		});

		it('should resolve to with canWithdraw: true if issue was connected to a closed PR authored by the viewer - single pull request once-connected', async () => {
			const issuePrData = { data: { viewer: { login: 'FlacoJones' }, resource: { id: 'I_kwDOGWnnz85GZ9JL', timelineItems: { edges: [{ node: { __typename: 'ConnectedEvent', createdAt: '2022-03-25T19:50:51Z', subject: { __typename: 'PullRequest', id: 'PR_kwDOGWnnz841Chat', merged: true, mergedAt: '2022-03-25T19:51:03Z', permalink: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/116', author: { login: 'FlacoJones' } } } }] } } } };

			mock
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, issuePrData);

			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).resolves.toEqual({ 'canWithdraw': true, type: 'SUCCESS', issueId: 'I_kwDOGWnnz85GZ9JL', errorMessage: null });
		});
	});
});
