const checkWithdrawalEligibility = require('../lib/checkWithdrawalEligibility');
const {
	ISSUE_DOES_NOT_EXIST,
	GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES
} = require('../errors');

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

describe('checkWithdrawalEligibility', () => {
	let issueUrl = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/93';
	let oauthToken = 'oAuthToken';
	let mock;

	beforeAll(() => {
		mock = new MockAdapter(axios);
	});

	beforeEach(() => {
		mock.reset();
	});

	describe('Retrieving issueId', () => {
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

	describe('Correctly verify withdrawal eligibility', () => {
		it('should resolve to with canWithdraw: true if issue was linked by a closed PR', async () => {
			const issuePrData = { data: { viewer: { login: 'FlacoJones' }, organization: { login: 'OpenQDev', repository: { issue: { id: 'I_kwDOGWnnz85GPg2F', repository: { owner: { login: 'OpenQDev' } }, timelineItems: { edges: [{ node: { source: { __typename: 'PullRequest', merged: true, author: { login: 'FlacoJones' }, baseRepository: { owner: { login: 'OpenQDev' } } } } }, { node: {} }] } } } } } };

			mock
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, issuePrData);

			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).resolves.toEqual({ 'canWithdraw': true, type: 'SUCCESS', issueId: 'I_kwDOGWnnz85GPg2F', errorMessage: null });
		});

		it('should resolve to with canWithdraw: false if issue was linked by a closed PR', async () => {
			const issuePrData = { data: { viewer: { login: 'FlacoJones' }, organization: { login: 'OpenQDev', repository: { issue: { id: 'I_kwDOGWnnz85GPg2F', repository: { owner: { login: 'OpenQDev' } }, timelineItems: { edges: [{ node: { source: { __typename: 'PullRequest', merged: true, author: { login: 'FlacoJones' }, baseRepository: { owner: { login: 'FlacoJones' } } } } }, { node: {} }] } } } } } };

			mock
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, issuePrData);

			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual({ 'canWithdraw': false, type: 'NO_WITHDRAWABLE_PR_FOUND', issueId: 'I_kwDOGWnnz85GPg2F', errorMessage: 'No withdrawable PR found' });
		});
	});
});
