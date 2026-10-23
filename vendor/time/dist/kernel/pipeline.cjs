//#region src/kernel/pipeline.ts
function insertByPriority(bucket, entry) {
	let i = bucket.length;
	while (i > 0 && bucket[i - 1].priority > entry.priority) i--;
	bucket.splice(i, 0, entry);
}
var StageRegistry = class {
	constructor() {
		this.projection = /* @__PURE__ */ new Map();
		this.transform = /* @__PURE__ */ new Map();
		this.validate = /* @__PURE__ */ new Map();
	}
	add(contribution) {
		const priority = contribution.priority ?? 0;
		if (contribution.pipeline === "projection") {
			insertByPriority(this.bucket(this.projection, contribution.stage), {
				priority,
				run: contribution.run
			});
			return;
		}
		if (contribution.kind === "transform") {
			insertByPriority(this.bucket(this.transform, contribution.stage), {
				priority,
				run: contribution.run
			});
			return;
		}
		insertByPriority(this.bucket(this.validate, contribution.stage), {
			priority,
			run: contribution.run
		});
	}
	projectionStages(stage) {
		return (this.projection.get(stage) ?? []).map((e) => e.run);
	}
	transformStages(stage) {
		return (this.transform.get(stage) ?? []).map((e) => e.run);
	}
	validateStages(stage) {
		return (this.validate.get(stage) ?? []).map((e) => e.run);
	}
	bucket(map, key) {
		let existing = map.get(key);
		if (!existing) {
			existing = [];
			map.set(key, existing);
		}
		return existing;
	}
};

//#endregion
exports.StageRegistry = StageRegistry;
//# sourceMappingURL=pipeline.cjs.map