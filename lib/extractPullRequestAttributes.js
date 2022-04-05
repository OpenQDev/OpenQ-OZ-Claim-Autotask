const extractPullRequestAttributes = (pullRequest) => {
	let merged = pullRequest.merged;
	let prAuthor = pullRequest.author.login;
	let baseRepositoryOwner = pullRequest.baseRepository.owner.login;
	let baseRepositoryName = pullRequest.baseRepository.name;
	let bodyText = pullRequest.bodyText;
	let mergedAt = pullRequest.mergedAt;
	let pullRequestCreatedAt = pullRequest.createdAt;
	let bodyEdits = pullRequest.userContentEdits.edges.map(node => node.node);
	let comments = pullRequest.comments.edges.map(node => node.node);

	return { merged, prAuthor, baseRepositoryOwner, baseRepositoryName, bodyText, bodyEdits, pullRequestCreatedAt, mergedAt, comments };
};

module.exports = extractPullRequestAttributes;