/*
GitHub provides no API for currently connected pull requests.
Only a sequence of CONNECTED_EVENTS and DISCONNECTED_EVENTS

*/

const getCurrentlyConnectedPullRequests = (timelineItems) => {
	let events = timelineItems.map(node => node.node);

	// sort all events by createdAt
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
		console.log(pullRequestConnectedMap[prId]);
		if (pullRequestConnectedMap[prId] == 'ConnectedEvent') {
			linkedPrs.push(pullRequestMap[prId]);
		}
	}

	// assemble an array of pull requests that have last event connected

	// if the last event added for ID was a connected event, then it is connected
	return linkedPrs;
};

module.exports = getCurrentlyConnectedPullRequests;