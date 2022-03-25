const cookie = require('cookie-signature');
const { NO_GITHUB_OAUTH_TOKEN, INVALID_GITHUB_OAUTH_TOKEN } = require('../errors');

const validateSignedOauthToken = (payoutAddress, event) => {
	return new Promise(async (resolve, reject) => {
		const cookieSigner = event.secrets.COOKIE_SIGNER;

		let signedOAuthToken;
		if (event.request && event.request.headers) {
			signedOAuthToken = event.request.headers['x-authorization'];
			if (!signedOAuthToken) {
				return reject(NO_GITHUB_OAUTH_TOKEN({ payoutAddress }));
			}
		} else {
			return reject(NO_GITHUB_OAUTH_TOKEN({ payoutAddress }));
		}

		const oauthToken = cookie.unsign(signedOAuthToken.slice(2), cookieSigner);

		if (!oauthToken) {
			return reject(INVALID_GITHUB_OAUTH_TOKEN({ payoutAddress }));
		}

		return resolve(oauthToken);
	});
};

module.exports = validateSignedOauthToken;