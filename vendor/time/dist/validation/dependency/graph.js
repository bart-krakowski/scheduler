//#region src/validation/dependency/graph.ts
function hasDependencyPath(events, fromId, toId) {
	const byId = new Map(events.map((event) => [event.id, event]));
	const seen = /* @__PURE__ */ new Set();
	const stack = [fromId];
	while (stack.length > 0) {
		const currentId = stack.pop();
		if (currentId === toId) return true;
		if (seen.has(currentId)) continue;
		seen.add(currentId);
		for (const dep of byId.get(currentId)?.dependsOn ?? []) stack.push(dep.id);
	}
	return false;
}

//#endregion
export { hasDependencyPath };
//# sourceMappingURL=graph.js.map