//#region src/kernel/modules/filter.ts
function filterModule(options) {
	return {
		name: "filter",
		contributions: [{
			pipeline: "projection",
			stage: "filter",
			priority: options.priority,
			run: (ctx) => {
				const predicates = options.getPredicates();
				if (predicates.length === 0) return ctx.events;
				return ctx.events.filter((event) => predicates.every((predicate) => predicate(event)));
			}
		}]
	};
}

//#endregion
export { filterModule };
//# sourceMappingURL=filter.js.map