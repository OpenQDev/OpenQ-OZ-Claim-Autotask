/* Returns tuple of (true, int)
True if string contains closer comment
Int of issue number
*/
const closerCommentRegex = (string) => {
	const regex = /(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved) (.*)?\/?(.*)?#(\d+)/gi;
	let m;
	let captureGroups = [];

	while ((m = regex.exec(string)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === regex.lastIndex) {
			regex.lastIndex++;
		}

		m.forEach((match, groupIndex) => {
			captureGroups[groupIndex] = match;
		});
	}

	const result = regex.test(string);
	return { containsCloser: result, issueNumber: parseInt(captureGroups[4]) };
};

module.exports = closerCommentRegex;