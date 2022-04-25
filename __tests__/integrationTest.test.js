const dotenv = require('dotenv');
dotenv.config();
const { handler } = require('../index.js');

describe('Claim Integration Test', () => {
	const validOAuthTokenFlacoJones = process.env.OAUTH_TOKEN;

	const issueReferencedAndMergedByFlacoJones = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/136';
	// const commentUpdatedAfterMerge = 'https://github.com/OpenQDev/OpenQ-TestRepo/pull/178';

	it('works', async () => {
		console.log(handler);
		await handler({});
		expect(true).toEqual(true);
	});
});