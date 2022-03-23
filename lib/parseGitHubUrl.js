const parseGitHubUrl = (githubUrl) => {
	let url;
	let pathArray = [];
	let githubData = [];

	try {
		url = new URL(githubUrl);
		pathArray = url.pathname.split('/');
	} catch (error) {
		return githubData;
	}
	// orgName
	githubData.push(pathArray[1]);

	// repoName
	githubData.push(pathArray[2]);

	// issue number or pull request number
	githubData.push(parseInt(pathArray[4]));

	return githubData;
};

module.exports = parseGitHubUrl;