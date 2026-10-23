import { filterModule } from "../../kernel/modules/filter.js";

//#region src/calendar/features/filter.ts
function eventFilterFeature() {
	const predicates = /* @__PURE__ */ new Map();
	const isEventVisible = (event) => {
		for (const predicate of predicates.values()) if (!predicate(event)) return false;
		return true;
	};
	return {
		name: "filter",
		module: () => filterModule({ getPredicates: () => [...predicates.values()] }),
		api: (host) => ({
			setEventFilter: (id, predicate) => {
				if (predicate) predicates.set(id, predicate);
				else if (!predicates.delete(id)) return;
				host.invalidateEvents();
			},
			clearEventFilters: () => {
				if (predicates.size === 0) return;
				predicates.clear();
				host.invalidateEvents();
			},
			getEventFilterIds: () => [...predicates.keys()],
			isEventVisible,
			getHiddenEvents: () => host.getEvents().filter((event) => !isEventVisible(event))
		})
	};
}

//#endregion
export { eventFilterFeature };
//# sourceMappingURL=filter.js.map