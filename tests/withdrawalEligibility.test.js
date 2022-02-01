const { checkWithdrawalEligibility } = require('../lib/checkWithdrawalEligibility');
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
const _ = require('lodash');

describe('checkWithdrawalEligibility', () => {
	let issueUrl = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/53';
	let oauthToken = 'oAuthToken';

	beforeAll(() => {
		mock = new MockAdapter(axios);
	});

	beforeEach(() => {
		mock.reset();
	});

	it('should respond with 401 if no auth token is provided', async () => {
		const data = { errors: [{ type: "NOT_FOUND" }] };
		mock.onPost('https://api.github.com/graphql').reply(200, data);
		await expect(checkWithdrawalEligibility(issueUrl, oauthToken)).rejects.toEqual(ISSUE_DOES_NOT_EXIST({ issueUrl }));
	});
});
