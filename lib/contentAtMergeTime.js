/**
 * Takes in both body and comments along with userContentEdits to return a snapshot
 * of text present at time of mergedAt.
 * This ensures that maintainers had a chance to survey the full pull request for Closer comments prior to merging
 */

const editIsInRangeBetweenCreationAndMerge = (pullRequestCreatedAtDate, mergedAtDate, editedAtDate) => {
	return pullRequestCreatedAtDate < editedAtDate && editedAtDate < mergedAtDate;
};

const contentAtMergeTime = (pullRequestCreatedAt, mergedAt, bodyText, userContentEdits) => {
	const mergedAtDate = new Date(mergedAt);
	const pullRequestCreatedAtDate = new Date(pullRequestCreatedAt);

	// If bodyText was never edited, return bodyText
	if (userContentEdits.length == 0) {
		return bodyText;
	} else {
		for (let userContentEdit of userContentEdits) {
			const editedAtDate = new Date(userContentEdit.editedAt);

			console.log(editIsInRangeBetweenCreationAndMerge(pullRequestCreatedAtDate, mergedAtDate, editedAtDate));
		}
		// Get all edit events in range between creation and merge

		// Choose latest one in that range

		// Return diff for the latest in range
	}
};

module.exports = contentAtMergeTime;