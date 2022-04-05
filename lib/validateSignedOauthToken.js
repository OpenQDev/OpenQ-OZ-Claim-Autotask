const { NO_GITHUB_OAUTH_TOKEN, INVALID_GITHUB_OAUTH_TOKEN } = require('../errors');
const unsignOauthToken = require('./unsignOauthToken');

const validateSignedOauthToken = (payoutAddress, event) => {
	return new Promise(async (resolve, reject) => {
		// Must change this secret name based on environment you are deploying to
		const cookieSigner = event.secrets.COOKIE_SIGNER_DEVELOPMENT;

		let signedOAuthToken;
		if (event.request && event.request.headers) {
			signedOAuthToken = event.request.headers['x-authorization'];
			if (!signedOAuthToken) {
				return reject(NO_GITHUB_OAUTH_TOKEN({ payoutAddress }));
			}
		} else {
			return reject(NO_GITHUB_OAUTH_TOKEN({ payoutAddress }));
		}

		/* Since we are not using Express.js for this oracle running as a lambda,
			 we must manually unsign the OAuth token from the header */
		const oauthToken = unsignOauthToken(signedOAuthToken, cookieSigner);

		if (!oauthToken) {
			return reject(INVALID_GITHUB_OAUTH_TOKEN({ payoutAddress }));
		}

		return resolve(oauthToken);
	});
};

module.exports = validateSignedOauthToken;