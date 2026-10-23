let _tanstack_devtools_event_client = require("@tanstack/devtools-event-client");

//#region src/client/TimeClient.ts
const MAX_EVENT_HISTORY = 100;
var TimeClient = class TimeClient extends _tanstack_devtools_event_client.EventClient {
	static {
		this.instance = null;
	}
	constructor() {
		super({ pluginId: "time" });
		this.eventHistory = [];
		this.onAllPluginEvents((event) => {
			this.eventHistory.push({
				type: event.type,
				payload: event.payload,
				timestamp: Date.now()
			});
			if (this.eventHistory.length > MAX_EVENT_HISTORY) this.eventHistory.splice(0, this.eventHistory.length - MAX_EVENT_HISTORY);
		});
	}
	static getInstance() {
		if (!TimeClient.instance) TimeClient.instance = new TimeClient();
		return TimeClient.instance;
	}
	getEventHistory() {
		return this.eventHistory;
	}
};
function getTimeClient() {
	return TimeClient.getInstance();
}

//#endregion
exports.getTimeClient = getTimeClient;
//# sourceMappingURL=TimeClient.cjs.map