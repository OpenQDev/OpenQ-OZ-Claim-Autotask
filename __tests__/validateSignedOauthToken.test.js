const validateSignedOauthToken = require('../lib/validateSignedOauthToken');
const cookie = require('cookie-signature');

describe('validateSignedOauthToken', () => {
	const oauthToken = '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';
	const cookieSigner = 'development';
	const signedOauthToken = 's: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.91UVEUqugprzdVYo/F9iK5BWC4u/FeHugUTg7vNRA7x9Q';

	const payoutAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

	it('should return NO_GITHUB_OAUTH_TOKEN if no headers are present', async () => {
		const noHeadersEvent = {
			secrets: {
				COOKIE_SIGNER: cookieSigner
			},
			request: {}
		};

		expect(validateSignedOauthToken(payoutAddress, noHeadersEvent)).rejects.toEqual({ 'canWithdraw': false, 'errorMessage': 'No GitHub OAuth token. You must sign in.', 'id': '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'type': 'NO_GITHUB_OAUTH_TOKEN' });
	});

	it('should return NO_GITHUB_OAUTH_TOKEN if no x-authorization header is present', async () => {
		const noXAuthorizationHeaderEvent = {
			secrets: {
				COOKIE_SIGNER: cookieSigner
			},
			request: {
				headers: {
					'foo': 'bar'
				}
			}
		};

		expect(validateSignedOauthToken(payoutAddress, noXAuthorizationHeaderEvent)).rejects.toEqual({ 'canWithdraw': false, 'errorMessage': 'No GitHub OAuth token. You must sign in.', 'id': '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'type': 'NO_GITHUB_OAUTH_TOKEN' });
	});

	it('should return INVALID_GITHUB_OAUTH_TOKEN if no x-authorization header is invalid', async () => {
		const invalidXAuthorizationHeaderEvent = {
			secrets: {
				COOKIE_SIGNER: cookieSigner
			},
			request: {
				headers: {
					'x-authorization': 's%3Agho_IDONOTWORK'
				}
			}
		};

		expect(validateSignedOauthToken(payoutAddress, invalidXAuthorizationHeaderEvent)).rejects.toEqual({ 'canWithdraw': false, 'errorMessage': 'Invalid GitHub OAuth toke unsigned by OpenQ', 'id': '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'type': 'INVALID_GITHUB_OAUTH_TOKEN' });
	});

	it('sign a cookie', async () => {
		const oauthToken = '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';
		const cookieSigner = 'development';
		const signedOauthToken = cookie.sign(oauthToken, cookieSigner);
		console.log(`${signedOauthToken}`);
	});

	it.only('should resolve with unsigned oauthToken all goes well', async () => {
		const validXAuthorizationHeaderEvent = {
			secrets: {
				COOKIE_SIGNER: cookieSigner
			},
			request: {
				headers: {
					'x-authorization': signedOauthToken
				}
			}
		};

		expect(validateSignedOauthToken(payoutAddress, validXAuthorizationHeaderEvent)).resolves.toEqual(oauthToken);
	});
});