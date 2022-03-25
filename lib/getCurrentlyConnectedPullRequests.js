/*
GitHub provides no API for currently connected pull requests.
Only a sequence of CONNECTED_EVENTS and DISCONNECTED_EVENTS

*/

const getCurrentlyConnectedPullRequests = (events) => {
	if (events.length == 0) { return []; }
	// sort all events by createdAt
	// it's likely in order anyways, but for suretys sake
	events.sort(function (event1, event2) {
		return new Date(event1.createdAt) - new Date(event2.createdAt);
	});

	let pullRequestMap = {};
	let pullRequestConnectedMap = {};
	for (let event of events) {
		const pullRequestId = event.subject.id;
		const eventType = event.__typename;
		// since the list is in order, the final overwrite will be CONNECTED_EVENT or DISCONNECTED_EVENT
		pullRequestConnectedMap[pullRequestId] = eventType;
		pullRequestMap[pullRequestId] = event.subject;
	}


	let linkedPrs = [];
	for (let prId in pullRequestConnectedMap) {
		const finalEventWasConnect = pullRequestConnectedMap[prId] == 'ConnectedEvent';
		if (finalEventWasConnect) {
			linkedPrs.push(pullRequestMap[prId]);
		}
	}
	return linkedPrs;
};

module.exports = getCurrentlyConnectedPullRequests;