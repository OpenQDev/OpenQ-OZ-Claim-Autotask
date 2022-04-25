const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const dotenv = require('dotenv');

const main = require('../main');
const { NO_GITHUB_OAUTH_TOKEN, INVALID_GITHUB_OAUTH_TOKEN, BOUNTY_IS_CLAIMED } = require('../errors');

describe('main', () => {
	dotenv.config();
	let event;
	let mock;
	let payoutAddress = '0x1abc0D6fb0d5A374027ce98Bf15716A3Ee31e580';
	let apiKey = 'mockApiKey';
	let apiSecret = 'mockApiSecret';

	// Test Issues
	let issueUrl = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/53';
	const issueReferencedAndMergedByFlacoJones = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/136';

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

	it('should respond with 401 if no header OR no oauth token is provided', async () => {
		event = {
			request: {
				body: {
					issueUrl,
					payoutAddress
				}
			},
			secrets: {
				COOKIE_SIGNER: process.env.COOKIE_SIGNER,
				OPENQ_PROXY_ADDRESS: process.env.OPENQ_PROXY_ADDRESS
			},
			apiKey,
			apiSecret,
		};

		await expect(main(event, {})).rejects.toEqual(NO_GITHUB_OAUTH_TOKEN({ payoutAddress }));

		event = {
			request: {
				body: {
					issueUrl,
					payoutAddress
				},
				headers: {
					'X-Authorization': undefined
				}
			},
			secrets: {
				COOKIE_SIGNER: process.env.COOKIE_SIGNER,
				OPENQ_PROXY_ADDRESS: process.env.OPENQ_PROXY_ADDRESS
			},
			apiKey,
			apiSecret,
		};

		await expect(main(event, {})).rejects.toEqual(NO_GITHUB_OAUTH_TOKEN({ payoutAddress }));
	});

	it('should respond with 401 if X-Authorization token is present but signature verification fails', async () => {
		event = {
			request: {
				body: {
					issueUrl,
					payoutAddress
				},
				headers: {
					'x-authorization': 's:gho_IDONOTWORK'
				}
			},
			secrets: {
				COOKIE_SIGNER: process.env.COOKIE_SIGNER,
				OPENQ_PROXY_ADDRESS: process.env.OPENQ_PROXY_ADDRESS
			},
			apiKey,
			apiSecret,
		};

		await expect(main(event, {})).rejects.toEqual(INVALID_GITHUB_OAUTH_TOKEN({ payoutAddress }));
	});

	it('should reject with BOUNTY_IS_CLAIMED if issue was closed by user, but bounty is already claimed', async () => {
		// ARRANGE

		// Set up mocks for checkWithdrawalEligibility, validateSignedOauthToken and OpenQ contract
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

		await expect(main(event, MockOpenQContract, checkWithdrawalEligibility, validateSignedOauthToken)).rejects.toEqual(BOUNTY_IS_CLAIMED({ issueUrl, payoutAddress }));
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

		// MockOpenQContract defaults to return 0x123abc when claimBounty is called
		await expect(main(event, MockOpenQContract, checkWithdrawalEligibility, validateSignedOauthToken)).resolves.toEqual({ txnHash: '0x123abc', issueId: 'mockIssueId' });
	});

	it.only('should reject if closer comment after merge', async () => {
		event = {
			request: {
				body: {
					issueUrl,
					payoutAddress
				},
				headers: {
					'x-authorization': process.env.SIGNED_OAUTH_TOKEN
				}
			},
			secrets: {
				COOKIE_SIGNER: process.env.COOKIE_SIGNER,
				OPENQ_PROXY_ADDRESS: process.env.OPENQ_PROXY_ADDRESS
			},
			apiKey,
			apiSecret,
		};

		const MockOpenQContract = require('../__mocks__/MockOpenQContract');
		MockOpenQContract.isOpen = true;

		await expect(main(event, MockOpenQContract)).resolves.toEqual({ txnHash: '0x123abc', issueId: 'mockIssueId' });
	});
});