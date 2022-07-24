/* Returns tuple of (true, int)
True if string contains closer comment
Int of issue number
*/
const tieredCommentRegex = (string) => {
	const baseRegex = 'OpenQ-Tier-(\\d+)-Winner';

	let tierRe = new RegExp(baseRegex, 'gi');

	let m;
	let tier;

	while ((m = tierRe.exec(string)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === tierRe.lastIndex) {
			tierRe.lastIndex++;
		}

		m.forEach((match, groupIndex) => {
			if (groupIndex == 1) {
				tier = match;
			}
		});
	}

	if (tier !== undefined) {
		return parseInt(tier);
	} else {
		return tier;
	}
};

module.exports = tieredCommentRegex;