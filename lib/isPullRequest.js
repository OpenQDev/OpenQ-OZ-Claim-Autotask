const isPullRequest = (timelineItem) => { return timelineItem.source && timelineItem.source.__typename == 'PullRequest'; };

module.exports = isPullRequest;