// const contentAtMergeTime = require('../lib/contentAtMergeTime');

// describe('contentAtMergeTime', () => {
// 	it('returns body if bodyEdits is empty (AKA body was unedited)', () => {
// 		const pullRequestCreatedAt = '2022-03-27T20:03:33Z';
// 		const mergedAt = '2022-03-27T20:03:50Z';
// 		const body = 'Closes #125';
// 		const bodyEdits = [];

// 		const result = contentAtMergeTime(pullRequestCreatedAt, mergedAt, body, bodyEdits);
// 		expect(result).toEqual(body);
// 	});

// 	it('returns latest bodyText before the merge', () => {
// 		const pullRequestCreatedAt = '2022-03-27T20:02:33Z';
// 		const mergedAt = '2022-03-27T20:03:50Z';

// 		const body = '';
// 		const bodyEdits = [
// 			{
// 				diff: 'Closes #126',
// 				updatedAt: '2022-03-27T20:03:59Z',
// 				createdAt: '2022-03-27T20:03:59Z',
// 				editedAt: '2022-03-27T20:03:59Z'
// 			},
// 			{
// 				diff: '',
// 				updatedAt: '2022-03-27T20:03:41Z',
// 				createdAt: '2022-03-27T20:03:41Z',
// 				editedAt: '2022-03-27T20:03:41Z'
// 			},
// 			{
// 				diff: 'Closes #125 ',
// 				updatedAt: '2022-03-27T20:03:41Z',
// 				createdAt: '2022-03-27T20:03:41Z',
// 				editedAt: '2022-03-27T20:03:33Z'
// 			}
// 		];

// 		const result = contentAtMergeTime(pullRequestCreatedAt, mergedAt, body, bodyEdits);
// 		expect(result).toEqual(body);
// 	});

// 	it('returns latest bodyText before the merge', () => {
// 		const pullRequestCreatedAt = '2022-03-27T21:26:06Z';
// 		const mergedAt = '2022-03-27T21:26:28Z';

// 		const bodyEdits = [
// 			{
// 				diff: 'After merge...',
// 				updatedAt: '2022-03-27T21:26:30Z',
// 				createdAt: '2022-03-27T21:26:30Z',
// 				editedAt: '2022-03-27T21:26:30Z'
// 			},
// 			{
// 				diff: 'Closes #134',
// 				updatedAt: '2022-03-27T21:26:24Z',
// 				createdAt: '2022-03-27T21:26:24Z',
// 				editedAt: '2022-03-27T21:26:24Z'
// 			},
// 			{
// 				diff: 'I edited this',
// 				updatedAt: '2022-03-27T21:26:13Z',
// 				createdAt: '2022-03-27T21:26:13Z',
// 				editedAt: '2022-03-27T21:26:13Z'
// 			},
// 			{
// 				diff: 'Closes #127 ',
// 				updatedAt: '2022-03-27T21:26:13Z',
// 				createdAt: '2022-03-27T21:26:13Z',
// 				editedAt: '2022-03-27T21:26:06Z'
// 			}
// 		];

// 		const currentBody = 'After merge...';
// 		const finalAtTimeOfMergeBody = 'Closes #134';

// 		const result = contentAtMergeTime(pullRequestCreatedAt, mergedAt, currentBody, bodyEdits);
// 		expect(result).toEqual(finalAtTimeOfMergeBody);
// 	});
// });