const axios = require('axios');
const dotenv = require('dotenv');
const _ = require('lodash');

const main = require('../main');
const { NO_GITHUB_OAUTH_TOKEN, INVALID_GITHUB_OAUTH_TOKEN, BOUNTY_IS_CLAIMED } = require('../errors');

describe('main-integration', () => {
	dotenv.config();
	let event;
	let payoutAddress = '0x1abc0D6fb0d5A374027ce98Bf15716A3Ee31e580';
	let apiKey = 'mockApiKey';
	let apiSecret = 'mockApiSecret';

	// Test Issues
	const issueReferencedAndMergedByFlacoJones = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/136';
	const noReferences = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/179';

	beforeEach(() => {
		event = {
			request: {
				body: {
					issueUrl: issueReferencedAndMergedByFlacoJones,
					payoutAddress
				},
				headers: {
					'X-Authorization': process.env.SIGNED_OAUTH_TOKEN
				}
			},
			secrets: {
				COOKIE_SIGNER: process.env.COOKIE_SIGNER,
				OPENQ_PROXY_ADDRESS: process.env.OPENQ_PROXY_ADDRESS
			},
			apiKey,
			apiSecret,
		};
	});

	it.only('should reject if no pr references', async () => {
		const obj = { request: { body: { issueUrl: noReferences } } };
		event = _.merge(event, obj);
		console.log(event);

		const MockOpenQContract = require('../__mocks__/MockOpenQContract');
		MockOpenQContract.isOpen = true;

		await expect(main(event, MockOpenQContract)).rejects.toEqual({ canWithdraw: false, errorMessage: 'No pull requests reference this issue.', issueId: 'I_kwDOGWnnz85Iaa3I', type: 'NO_PULL_REQUESTS_REFERENCE_ISSUE' });
	});
});