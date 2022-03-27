const MockOpenQContract = {
	isOpen: true,
	get isOpen() {
		return isOpen;
	},
	set isOpen(bool) {
		isOpen = bool;
	},
	bountyIsOpen: async (issueId) => {
		return new Promise(async (resolve, reject) => {
			resolve(isOpen);
		});
	},
	claimBounty: async (issueId, payoutAddress, options, hash = '0x123abc') => {
		return new Promise(async (resolve, reject) => {
			resolve({ hash });
		});
	}
};

module.exports = MockOpenQContract;