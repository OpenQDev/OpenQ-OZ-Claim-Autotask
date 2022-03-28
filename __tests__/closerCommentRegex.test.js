const closerCommentRegex = require('../lib/closerCommentRegex');

describe('closerCommentRegex', () => {
	// Well-formed strings
	let simpleCloses = 'Closes #14';
	let simpleFixes = 'fixes #1';
	let closesOrg = 'Closes OpenQDev/OpenQ-Frontend#143';

	// Malformed/Non-existent closer comment
	let noCloser = 'I contain no closer';
	let malformed = 'Closer #d';

	it('Returns true and proper number for well-formed closer comments', async () => {
		expect(closerCommentRegex(simpleCloses).containsCloser).toEqual(true);
		expect(closerCommentRegex(simpleCloses).issueNumber).toEqual(14);

		expect(closerCommentRegex(closesOrg).containsCloser).toEqual(true);
		expect(closerCommentRegex(closesOrg).issueNumber).toEqual(143);

		expect(closerCommentRegex(simpleFixes).containsCloser).toEqual(true);
		expect(closerCommentRegex(simpleFixes).issueNumber).toEqual(1);
	});

	it('Returns false and undefined for no closer or malformed closer', async () => {
		expect(closerCommentRegex(noCloser).containsCloser).toEqual(false);
		expect(closerCommentRegex(noCloser).issueNumber).toEqual(NaN);

		expect(closerCommentRegex(malformed).containsCloser).toEqual(false);
		expect(closerCommentRegex(malformed).issueNumber).toEqual(NaN);
	});
});