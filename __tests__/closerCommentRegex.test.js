const closerCommentRegex = require('../lib/closerCommentRegex');

describe('closerCommentRegex', () => {
	// Well-formed strings
	let simpleCloses = 'Closes #14';
	let simpleFixes = 'fixes #1';
	let closesOrg = 'Closes OpenQDev/OpenQ-TestRepo#143';
	let multipleCloses = 'this Closes #14 and later also closes OpenQDev/OpenQ-TestRepo#543 and other things';

	// Malformed/Non-existent closer comment
	let noCloser = 'I contain no closer';
	let malformed = 'Closer #d';

	it('Returns true and proper number for well-formed closer comments', async () => {
		expect(closerCommentRegex(simpleCloses, 'OpenQDev', 'OpenQ-TestRepo')).toEqual([14]);
		expect(closerCommentRegex(simpleFixes, 'OpenQDev', 'OpenQ-TestRepo')).toEqual([1]);
		expect(closerCommentRegex(closesOrg, 'OpenQDev', 'OpenQ-TestRepo')).toEqual([143]);
		expect(closerCommentRegex(noCloser, 'OpenQDev', 'OpenQ-TestRepo')).toEqual([]);
		expect(closerCommentRegex(multipleCloses, 'OpenQDev', 'OpenQ-TestRepo')).toEqual([14, 543]);
	});

	it('Returns false and undefined for no closer or malformed closer', async () => {
		expect(closerCommentRegex(noCloser, 'OpenQDev', 'OpenQ-TestRepo')).toEqual([]);
		expect(closerCommentRegex(malformed, 'OpenQDev', 'OpenQ-TestRepo')).toEqual([]);
	});
});