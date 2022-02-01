// const axios = require('axios');
// const MockAdapter = require("axios-mock-adapter");
// const _ = require('lodash');

// const main = require('../main');
// const { NO_GITHUB_OAUTH_TOKEN, INVALID_GITHUB_OAUTH_TOKEN } = require('../errors');

// describe('main', () => {
// 	let event;
// 	let contract;
// 	let mock;
// 	let payoutAddress = '0x1abc0D6fb0d5A374027ce98Bf15716A3Ee31e580';
// 	let issueUrl = 'https://github.com/OpenQDev/OpenQ-TestRepo/issues/53';
// 	let validSignedOAuthToken = 'gho_abc23.WX10blG9QXCel8twi6gjLNtILNdWo/Xv5hwxW6bfpXU';
// 	let COOKIE_SIGNING_ENTROPY = 'entropydfnjd23';
// 	let OPENQ_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
// 	let apiKey = 'mockApiKey';
// 	let apiSecret = 'mockApiSecret';

// 	beforeAll(() => {
// 		mock = new MockAdapter(axios);
// 	});

// 	beforeEach(() => {
// 		mock.reset();

// 		event = {
// 			request: {
// 				body: {
// 					issueUrl,
// 					payoutAddress
// 				},
// 				headers: {
// 					'X-Authorization': validSignedOAuthToken
// 				}
// 			},
// 			secrets: {
// 				COOKIE_SIGNING_ENTROPY,
// 				OPENQ_ADDRESS
// 			},
// 			apiKey,
// 			apiSecret,
// 		};
// 	});

// 	it('should respond with 401 if no auth token is provided', async () => {
// 		event = _.update(event, 'request.headers', () => undefined);

// 		await expect(main(event, {})).rejects.toEqual(NO_GITHUB_OAUTH_TOKEN({ payoutAddress }));

// 		event = _.update(event, 'request.headers.X-Authorization', () => undefined);
// 		await expect(main(event, {})).rejects.toEqual(NO_GITHUB_OAUTH_TOKEN({ payoutAddress }));
// 	});

// 	it('should respond with 401 if X-Authorization token is present but signature verification fails', async () => {
// 		event = _.update(event, 'request.headers.X-Authorization', () => 'invalid_oauth');
// 		await expect(main(event, {})).rejects.toEqual(INVALID_GITHUB_OAUTH_TOKEN({ payoutAddress }));
// 	});
// });