/* Returns tuple of (true, int)
True if string contains closer comment
Int of issue number
*/
const closerCommentRegex = (string, baseRepoOrganization, baseRepository) => {
	// We need to dynamically construct a RegEx from the organization and repository
	const baseRegex = '(closes|close|closed|fix|fixes|fixed|resolve|resolves|resolved) (baseRepoOrganization)?\\/?(baseRepository)?#(\\d+)';
	const urlBaseRegex = '(closes|close|closed|fix|fixes|fixed|resolve|resolves|resolved) (https:\/\/github\.com\/(baseRepoOrganization)\/(baseRepository)\/issues\/(\\d+))';

	const replaceOrg = 'baseRepoOrganization';
	const reOrg = new RegExp(replaceOrg, 'gi');
	const replacedOrg = baseRegex.replace(reOrg, baseRepoOrganization);
	const replacedOrgUrl = urlBaseRegex.replace(reOrg, baseRepoOrganization);

	const replaceRepo = 'baseRepository';
	const reRepo = new RegExp(replaceRepo, 'gi');
	const replacedRepoAndOrg = replacedOrg.replace(reRepo, baseRepository);
	const replacedRepoAndOrgUrl = replacedOrgUrl.replace(reRepo, baseRepository);

	let closerRe = new RegExp(replacedRepoAndOrg, 'gi');
	let closerUrlRe = new RegExp(replacedRepoAndOrgUrl, 'gi');

	let m;
	let closerIssueNumbers = [];

	while ((m = closerRe.exec(string)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === closerRe.lastIndex) {
			closerRe.lastIndex++;
		}

		m.forEach((match, groupIndex) => {
			if (groupIndex == 4) {
				closerIssueNumbers.push(match);
			}
		});
	}

	while ((m = closerUrlRe.exec(string)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === closerRe.lastIndex) {
			closerRe.lastIndex++;
		}

		m.forEach((match, groupIndex) => {
			if (groupIndex == 5) {
				closerIssueNumbers.push(match);
			}
		});
	}

	let closerIssueNumbersInt = closerIssueNumbers.map(issueNumber => parseInt(issueNumber));

	return closerIssueNumbersInt;
};

module.exports = closerCommentRegex;