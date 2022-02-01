const axios = require('axios');
const MockAdapter = require("axios-mock-adapter");

const main = require('../main');

describe('main', () => {
	let event;
	let contract;
	let mock;

	beforeAll(() => {
		mock = new MockAdapter(axios);
	});

	beforeEach(() => {
		event = {
			request: {
				body: {
					issueUrl: '',
					payoutAddress: ''
				},
				headers: {
					'X-Authorization': 'signedToken'
				}
			},
			secrets: {
				COOKIE_SIGNING_ENTROPY: '',
				OPENQ_ADDRESS: ''
			},
			apiKey: 'apiKey',
			apiSecret: 'apiSecret',
		};
	});

	it('should respond with an error if issue is not closed', async () => {
		const url = 'https://api.github.com/graphql';
		mock.onPost(url).reply(200, { txnHash: "sdf" });
	});
});