const tieredCommentRegex = require('../lib/tieredCommentRegex');

describe('tieredCommentRegex', () => {
	// Well-formed strings
	let firstPlace = 'OpenQ-Tier-1-Winner';
	let secondPlace = 'OpenQ-Tier-2-Winner';

	// Malformed/Non-existent closer comment
	let nothing = 'nothing';

	it('Returns true and proper number for well-formed closer comments', async () => {
		expect(tieredCommentRegex(firstPlace)).toEqual(1);
		expect(tieredCommentRegex(secondPlace)).toEqual(2);
	});

	it('Returns false and undefined for no closer or malformed closer', async () => {
		expect(tieredCommentRegex(nothing)).toEqual(undefined);
	});
});