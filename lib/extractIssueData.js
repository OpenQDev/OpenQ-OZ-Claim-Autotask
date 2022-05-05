const extractIssueData = (result) => {
	const issueId = result.data.data.resource.id;
	const issueNumber = result.data.data.resource.number;
	const issueRepositoryOwner = result.data.data.resource.repository.owner.login;
	// Sort timeline items by createdAt
	const timelineItems = result.data.data.resource.timelineItems.edges.map(node => node.node);

	return { issueId, issueRepositoryOwner, timelineItems, issueNumber };
};

module.exports = extractIssueData;