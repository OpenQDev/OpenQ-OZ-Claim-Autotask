const dotenv = require('dotenv');
const _ = require('lodash');
const main = require('../main');
dotenv.config();

describe('main-integration', () => {
	let event;
	let payoutAddress = '0x1abc0D6fb0d5A374027ce98Bf15716A3Ee31e580';
	let apiKey = 'mockApiKey';
	let apiSecret = 'mockApiSecret';

	// Test Issues

	// BODY REFERENCES
	// SUCCESS - BODY REFERENCE - NO EDITS
	const issueReferencedAndMergedByFlacoJones = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/136';

	// SUCCESS - BODY REFERENCE - PRE-MERGE EDITS
	const _1 = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/136';

	// FAILS - BODY REFERENCE - POST-MERGE EDITS
	const _2 = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/136';

	// COMMENT REFERENCES
	// SUCCESS - COMMENT REFERENCE - NO EDITS
	const _3 = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/136';

	// SUCCESS - COMMENT REFERENCE - PRE-MERGE EDITS
	const _4 = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/136';

	// FAILS - COMMENT REFERENCE - POST-MERGE EDITS
	const _5 = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/136';

	// NO REFERNECES
	// FAILS - NO PULL REQUEST REFERENCES
	const noPullRequestReferences = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/179';

	// MERGE
	// FAILS - NOT MERGED
	const referencedButNotMerged = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/139';

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

	it('should reject with NO_PULL_REQUESTS_REFERENCE_ISSUE if no pull request references the issue', async () => {
		const obj = { request: { body: { issueUrl: noPullRequestReferences } } };
		event = _.merge(event, obj);

		const MockOpenQContract = require('../__mocks__/MockOpenQContract');
		MockOpenQContract.isOpen = true;

		await expect(main(event, MockOpenQContract)).rejects.toEqual({ canWithdraw: false, errorMessage: 'No pull requests reference this issue.', issueId: 'I_kwDOGWnnz85Iaa3I', type: 'NO_PULL_REQUESTS_REFERENCE_ISSUE' });
	});

	it.only('should reject if pull request is not merged', async () => {
		const obj = { request: { body: { issueUrl: referencedButNotMerged } } };
		event = _.merge(event, obj);

		const MockOpenQContract = require('../__mocks__/MockOpenQContract');
		MockOpenQContract.isOpen = true;

		await expect(main(event, MockOpenQContract)).rejects.toEqual({ canWithdraw: false, issueId: 'I_kwDOGWnnz85GkCSK', type: 'NO_WITHDRAWABLE_PR_FOUND', errorMessage: 'No withdrawable PR found.  In order for a pull request to unlock a claim, it must mention the associated bountied issue, be authored by you and merged by a maintainer. We found the following linked pull requests that do not meet the above criteria: https://github.com/OpenQDev/OpenQ-TestRepo/pull/140' });
	});

	it('should resolve with issueId and txnHash for properly referenced issue - pull request body, no edits', async () => {
		const obj = { request: { body: { issueUrl: issueReferencedAndMergedByFlacoJones } } };
		event = _.merge(event, obj);

		const MockOpenQContract = require('../__mocks__/MockOpenQContract');
		MockOpenQContract.isOpen = true;

		await expect(main(event, MockOpenQContract)).resolves.toEqual({ issueId: 'I_kwDOGWnnz85GjwA1', txnHash: '0x123abc' });
	});
});