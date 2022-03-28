/**
 * Takes in both bodyText and userContentEdits of either a Pull Request comment OR Pull Request body
 * Pull Request Comments and Pull Request Bodies are treated separately in the GitHub API
 * Returns the bodyText of the comment/body visible at merge time
 * This ensures that maintainers had a chance to survey the full pull request for Closer comments prior to merging
 */
const contentAtMergeTime = (mergedAt, bodyText, userContentEdits, createdAt) => {
	const mergedAtDate = new Date(mergedAt);
	const commentCreatedAtDate = new Date(createdAt);

	if (commentCreatedAtDate > mergedAtDate) {
		// If comment was created after merge, return empty string
		return '';
	} else if (userContentEdits.length == 0) {
		// If comment is unedited, return bodyText as is
		return bodyText;
	} else {
		/* If comment was created pre-merge, and has been edited
			 Get the last edit event that occured before the merge
			 This final edit event will be what was visible to the maintainer when they merged
		*/
		for (let userContentEdit of userContentEdits) {
			const editedAtDate = new Date(userContentEdit.editedAt);
			if (editedAtDate < mergedAtDate) {
				// Due to the ordering of the edits from most to least recent
				// the first edit we come across with editedAt pre-merge will be the LATEST pre-merge edit
				// So we return the diff (bodyText of the comment at that time)
				return userContentEdit.diff;
			}
		}

		// Arriving here means all edits to comment were made post-merge and should not be considered
		return '';
	}
};

module.exports = contentAtMergeTime;