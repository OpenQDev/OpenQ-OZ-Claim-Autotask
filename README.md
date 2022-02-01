# OpenQ-OZ-Claim-AutoTask

Add your admin API_KEY and API_SECRET to your .env file

Mumbai
```bash
yarn add defender-autotask-client
defender-autotask update-code aabc7005-3f05-40cf-af97-8a565bcb892e .
```

Running Locally

Due to body size limits on OZ tasks, the following dev deps are only needed for local development, but cannot be included in the `node_modules/` folder at the time of pushing code.

```json
	"devDependencies": {
		"dotenv": "^14.3.2",
    "ethers": "5.4.1",
    "express": "^4.17.2",
    "nodemon": "^2.0.15",
		"defender-relay-client": "1.11.1",
		"jest": "^27.4.7",
		"lodash": "^4.17.21"
	}
```