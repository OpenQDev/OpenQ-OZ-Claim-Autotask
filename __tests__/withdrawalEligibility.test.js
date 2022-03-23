const checkWithdrawalEligibility = require('../lib/checkWithdrawalEligibility');
const {
	NO_GITHUB_OAUTH_TOKEN,
	INVALID_GITHUB_OAUTH_TOKEN,
	ISSUE_DOES_NOT_EXIST,
	ISSUE_NOT_CLOSED,
	ISSUE_NOT_CLOSED_BY_PR,
	ISSUE_NOT_CLOSED_BY_USER,
	BOUNTY_IS_CLAIMED,
	UNKNOWN_ERROR,
	GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES
} = require('../errors');

const axios = require('axios');
const MockAdapter = require("axios-mock-adapter");

describe('checkWithdrawalEligibility', () => {
	let issueUrl = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/93';
	let oauthToken = 'oAuthToken';

	beforeAll(() => {
		// mock = new MockAdapter(axios);
	});

	beforeEach(() => {
		// mock.reset();
	});

	describe('Retrieving issueId', () => {
		it.only('should print result', async () => {
			try {
				const result = await checkWithdrawalEligibility(issueUrl, "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");
				console.log(result);
			} catch (error) {
				console.log(error);
			}
		});

		it('should reject with ISSUE_DOES_NOT_EXIST error if issue is not found', async () => {
			const data = { errors: [{ type: "NOT_FOUND" }] };
			mock.onPost('https://api.github.com/graphql').reply(200, data);
			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual(ISSUE_DOES_NOT_EXIST({ issueUrl }));
		});

		it('should reject with GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES error if GitHub returns a 401', async () => {
			const data = { errors: [{ type: "NOT_FOUND" }] };
			mock.onPost('https://api.github.com/graphql').reply(401);
			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual(GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES({ issueId: '' }));
		});

		it('should reject with GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES error if GitHub returns a 401', async () => {
			const data = { errors: [{ type: "NOT_FOUND" }] };
			mock.onPost('https://api.github.com/graphql').reply(401);
			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual(GITHUB_OAUTH_TOKEN_LACKS_PRIVILEGES({ issueId: '' }));
		});
	});

	describe('Retrieving closer of issue', () => {
		it('should reject with ISSUE_NOT_CLOSED error if issue is still open on GitHub', async () => {
			const mockIssueId = "mockIssueId";

			const issueIdData = { data: { repository: { issue: { id: mockIssueId } }, viewer: { login: "FlacoJones" } } };
			const closerData = { data: { node: { closed: false, timelineItems: { nodes: [{ closer: { url: 'sdfsd', author: { login: 'FlacoJones' } } }] } }, viewer: { login: "FlacoJones" } } };

			mock
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, issueIdData)
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, closerData);

			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual(ISSUE_NOT_CLOSED({ issueId: mockIssueId, issueUrl }));
		});

		it('should reject with ISSUE_NOT_CLOSED_BY_PR error if issue is not closed by PR', async () => {
			const mockIssueId = "mockIssueId";

			const issueIdData = { data: { repository: { issue: { id: mockIssueId } }, viewer: { login: "FlacoJones" } } };
			const closerData = { data: { node: { closed: true, timelineItems: { nodes: [{ closer: null }] } }, viewer: { login: "FlacoJones" } } };

			mock
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, issueIdData)
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, closerData);

			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual(ISSUE_NOT_CLOSED_BY_PR({ issueId: mockIssueId, issueUrl }));
		});

		it('should reject with ISSUE_NOT_CLOSED_BY_USER error if issue was closed by someone else', async () => {
			const mockIssueId = "mockIssueId";

			const issueIdData = { data: { repository: { issue: { id: mockIssueId } }, viewer: { login: "FlacoJones" } } };
			const closerData = { data: { node: { closed: true, timelineItems: { nodes: [{ closer: { url: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/54', author: { login: 'NotFlacoJones' } } }] } }, viewer: { login: "FlacoJones" } } };

			const message = ISSUE_NOT_CLOSED_BY_USER({ issueId: mockIssueId, issueUrl, viewer: "FlacoJones", closer: "NotFlacoJones", prUrl: "https://github.com/OpenQDev/OpenQ-TestRepo/pull/54" });

			mock
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, issueIdData)
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, closerData);

			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual(message);
		});

		it('should resolve to true if ANY of the timeline events include a closer of which the user is author', async () => {
			const mockIssueId = "mockIssueId";

			const issueIdData = { data: { repository: { issue: { id: mockIssueId } }, viewer: { login: "FlacoJones" } } };
			const closerData = { data: { node: { closed: true, timelineItems: { nodes: [{ closer: null }, { closer: { url: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/54', author: { login: 'NotFlacoJones' } } }] } }, viewer: { login: "FlacoJones" } } };

			const message = ISSUE_NOT_CLOSED_BY_USER({ issueId: mockIssueId, issueUrl, viewer: "FlacoJones", closer: "NotFlacoJones", prUrl: "https://github.com/OpenQDev/OpenQ-TestRepo/pull/54" });

			mock
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, issueIdData)
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, closerData);

			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual(message);
		});

		it('should resolve to true if issue was closed by PR from viewer', async () => {
			const mockIssueId = "mockIssueId";

			const issueIdData = { data: { repository: { issue: { id: mockIssueId } }, viewer: { login: "FlacoJones" } } };
			const closerData = { data: { node: { closed: true, timelineItems: { nodes: [{ closer: null }, { closer: { url: 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/54', author: { login: 'FlacoJones' } } }] } }, viewer: { login: "FlacoJones" } } };

			mock
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, issueIdData)
				.onPost('https://api.github.com/graphql')
				.replyOnce(200, closerData);

			await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).resolves.toEqual({ "canWithdraw": true, "issueId": "mockIssueId" });
		});
	});
});
