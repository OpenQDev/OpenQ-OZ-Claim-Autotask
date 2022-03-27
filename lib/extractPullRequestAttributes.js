const extractPullRequestAttributes = (pullRequest) => {
	let merged = pullRequest.merged;
	let prAuthor = pullRequest.author.login;
	let baseRepositoryOwner = pullRequest.baseRepository.owner.login;
	let bodyText = pullRequest.bodyText;
	let mergedAt = pullRequest.mergedAt;
	let pullRequestCreatedAt = pullRequest.createdAt;
	let bodyEdits = pullRequest.userContentEdits.edges.map(node => node.node);

	return { merged, prAuthor, baseRepositoryOwner, bodyText, bodyEdits, pullRequestCreatedAt, mergedAt };
};

module.exports = extractPullRequestAttributes;