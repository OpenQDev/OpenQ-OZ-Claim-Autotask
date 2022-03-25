const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const _ = require('lodash');

const main = require('../main');
const { NO_GITHUB_OAUTH_TOKEN, INVALID_GITHUB_OAUTH_TOKEN, BOUNTY_IS_CLAIMED } = require('../errors');

describe('main', () => {
	let event;
	let mock;
	let payoutAddress = '0x1abc0D6fb0d5A374027ce98Bf15716A3Ee31e580';
	let issueUrl = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/53';
	let validSignedOAuthToken = 's:gho_sd34fd.1KAuAkesI8Mt6/1Vc0Gs1EtYI/54zJatUWL8E407YQU';
	let COOKIE_SIGNER = 'entropydfnjd23';
	let OPENQ_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
	let apiKey = 'mockApiKey';
	let apiSecret = 'mockApiSecret';

	beforeAll(() => {
		mock = new MockAdapter(axios);
	});

	beforeEach(() => {
		mock.reset();

		event = {
			request: {
				body: {
					issueUrl,
					payoutAddress
				},
				headers: {
					'X-Authorization': validSignedOAuthToken
				}
			},
			secrets: {
				COOKIE_SIGNER,
				OPENQ_ADDRESS
			},
			apiKey,
			apiSecret,
		};
	});

	it.only('should respond with 401 if no auth token is provided', async () => {
		event = _.update(event, 'request.headers', () => undefined);

		await expect(main(event, {})).rejects.toEqual(NO_GITHUB_OAUTH_TOKEN({ payoutAddress }));

		event = _.update(event, 'request.headers.X-Authorization', () => undefined);
		await expect(main(event, {})).rejects.toEqual(NO_GITHUB_OAUTH_TOKEN({ payoutAddress }));
	});

	it('should respond with 401 if X-Authorization token is present but signature verification fails', async () => {
		event = _.update(event, 'request.headers.X-Authorization', () => 'invalid_oauth');
		await expect(main(event, {})).rejects.toEqual(INVALID_GITHUB_OAUTH_TOKEN({ payoutAddress }));
	});

	it('should reject with BOUNTY_IS_CLAIMED if issue was closed by user, but bounty is already claimed', async () => {
		const message = BOUNTY_IS_CLAIMED({ issueUrl, payoutAddress });

		jest.mock('../lib/checkWithdrawalEligibility', () => {
			return jest.fn(() => {
				return { canWithdraw: true, issueId: 'mockIssueId' };
			});
		});
		const checkWithdrawalEligibility = require('../lib/checkWithdrawalEligibility');

		jest.mock('../lib/validateSignedOauthToken', () => {
			return jest.fn(() => {
				return { oauthToken: 'mockOAuthToken' };
			});
		});
		const validateSignedOauthToken = require('../lib/checkWithdrawalEligibility');

		const MockOpenQContract = require('../__mocks__/MockOpenQContract');
		MockOpenQContract.isOpen = false;

		await expect(main(event, MockOpenQContract, checkWithdrawalEligibility, validateSignedOauthToken)).rejects.toEqual(message);
	});

	it('should call contract.claimBounty if bounty is open', async () => {
		jest.mock('../lib/checkWithdrawalEligibility', () => {
			return jest.fn(() => {
				return { canWithdraw: true, issueId: 'mockIssueId' };
			});
		});
		const checkWithdrawalEligibility = require('../lib/checkWithdrawalEligibility');

		jest.mock('../lib/validateSignedOauthToken', () => {
			return jest.fn(() => {
				return { oauthToken: 'mockOAuthToken' };
			});
		});
		const validateSignedOauthToken = require('../lib/checkWithdrawalEligibility');

		const MockOpenQContract = require('../__mocks__/MockOpenQContract');
		MockOpenQContract.isOpen = true;

		await expect(main(event, MockOpenQContract, checkWithdrawalEligibility, validateSignedOauthToken)).resolves.toEqual({ txnHash: '0x38sdf', issueId: 'mockIssueId' });
	});
});