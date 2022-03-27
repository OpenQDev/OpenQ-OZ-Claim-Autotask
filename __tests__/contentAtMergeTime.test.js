const contentAtMergeTime = require('../lib/contentAtMergeTime');

describe('contentAtMergeTime', () => {
	it('returns body if bodyEdits is empty (AKA body was unedited)', () => {
		const pullRequestCreatedAt = '2022-03-27T20:03:33Z';
		const mergedAt = '2022-03-27T20:03:50Z';
		const body = 'Closes #125';
		const bodyEdits = [];

		const result = contentAtMergeTime(pullRequestCreatedAt, mergedAt, body, bodyEdits);
		expect(result).toEqual(body);
	});

	it.only('returns latest bodyText before the merge', () => {
		const pullRequestCreatedAt = '2022-03-27T20:02:33Z';
		const mergedAt = '2022-03-27T20:03:50Z';

		const body = '';
		const bodyEdits = [
			{
				diff: 'Closes #126',
				updatedAt: '2022-03-27T20:03:59Z',
				createdAt: '2022-03-27T20:03:59Z',
				editedAt: '2022-03-27T20:03:59Z'
			},
			{
				diff: '',
				updatedAt: '2022-03-27T20:03:41Z',
				createdAt: '2022-03-27T20:03:41Z',
				editedAt: '2022-03-27T20:03:41Z'
			},
			{
				diff: 'Closes #125 ',
				updatedAt: '2022-03-27T20:03:41Z',
				createdAt: '2022-03-27T20:03:41Z',
				editedAt: '2022-03-27T20:03:33Z'
			}
		];

		const result = contentAtMergeTime(pullRequestCreatedAt, mergedAt, body, bodyEdits);
		expect(result).toEqual(body);
	});
});