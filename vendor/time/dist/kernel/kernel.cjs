const require_types = require('./types.cjs');
const require_pipeline = require('./pipeline.cjs');
const require_history = require('./history.cjs');

//#region src/kernel/kernel.ts
function toMs(input) {
	if (typeof input === "number") return input;
	if (input instanceof Date) return input.getTime();
	return new Date(input).getTime();
}
function overlapsViewport(event, viewport) {
	return toMs(event.end) >= toMs(viewport.start) && toMs(event.start) <= toMs(viewport.end);
}
function widen(a, b) {
	if (!a) return b;
	if (!b) return a;
	return {
		start: toMs(a.start) <= toMs(b.start) ? a.start : b.start,
		end: toMs(a.end) >= toMs(b.end) ? a.end : b.end
	};
}
function opSpan(op) {
	if (require_types.isIntentOp(op)) return null;
	const event = op.kind === "add" ? op.event : op.kind === "update" ? op.after : op.event;
	const startMs = toMs(event.start);
	const endMs = toMs(event.end);
	return {
		start: new Date(Math.min(startMs, endMs)).toISOString(),
		end: new Date(Math.max(startMs, endMs)).toISOString()
	};
}
function createKernel(options) {
	return new Kernel({
		events: options.events,
		config: options.config
	}).use(...Object.values(options.modules));
}
var Kernel = class {
	constructor(options = {}) {
		this.events = /* @__PURE__ */ new Map();
		this.registry = new require_pipeline.StageRegistry();
		this.modules = [];
		this.history = [];
		this.api = {};
		this.config = options.config ?? {};
		for (const event of options.events ?? []) this.events.set(event.id, event);
	}
	use(...modules) {
		for (const module of modules) {
			this.modules.push(module);
			for (const contribution of module.contributions) this.registry.add(contribution);
		}
		for (const module of modules) this.mergeApi(module);
		this.assertRequires();
		return this;
	}
	load(events, options = {}) {
		if (options.replace) this.events.clear();
		for (const event of events) this.events.set(event.id, event);
	}
	getEvents() {
		return [...this.events.values()];
	}
	getEvent(id) {
		return this.events.get(id);
	}
	getRequiredRange(op) {
		let range = opSpan(op);
		for (const module of this.modules) if (module.getRequiredRange) range = widen(range, module.getRequiredRange(op, this.config));
		return range;
	}
	project(viewport) {
		let events = this.getEvents();
		for (const stageName of require_types.PROJECTION_ORDER) {
			if (stageName === "clip-to-viewport") {
				events = events.filter((event) => overlapsViewport(event, viewport));
				continue;
			}
			for (const run of this.registry.projectionStages(stageName)) events = run({
				events,
				viewport,
				config: this.config
			});
		}
		return events;
	}
	write(input, reason) {
		const ops = Array.isArray(input) ? input : [input];
		const first = ops[0];
		const ctx = this.writeCtx();
		let batch = {
			reason: reason ?? (first === void 0 ? "empty" : require_types.isIntentOp(first) ? first.intent : first.kind),
			ops
		};
		for (const stageName of require_types.WRITE_TRANSFORM_ORDER) {
			if (batch.replay) break;
			for (const run of this.registry.transformStages(stageName)) {
				batch = run(batch, ctx);
				if (batch.replay) break;
			}
		}
		const unresolved = batch.ops.filter(require_types.isIntentOp);
		if (unresolved.length > 0) throw new Error(`Kernel: unresolved intent op(s) after the write transform stages: ${unresolved.map((o) => o.intent).join(", ")}. Register a module that expands them.`);
		if (!batch.replay) {
			const conflicts = require_types.WRITE_VALIDATE_ORDER.flatMap((stageName) => this.registry.validateStages(stageName).flatMap((run) => run(batch, ctx)));
			if (conflicts.length > 0) return {
				status: "rejected",
				conflicts
			};
		}
		this.commit(batch);
		for (const run of this.registry.transformStages(require_types.WRITE_EMIT_STAGE)) batch = run(batch, ctx);
		return {
			status: "committed",
			batch
		};
	}
	rollback() {
		const batch = this.history.pop();
		if (!batch) return null;
		for (let i = batch.ops.length - 1; i >= 0; i--) {
			const op = batch.ops[i];
			if (require_types.isIntentOp(op)) continue;
			this.invert(op);
		}
		return batch;
	}
	commit(batch) {
		for (const op of batch.ops) {
			if (require_types.isIntentOp(op)) continue;
			this.apply(op);
		}
		this.history.push(batch);
	}
	apply(op) {
		if (op.kind === "add") this.events.set(op.event.id, op.event);
		else if (op.kind === "update") this.events.set(op.id, op.after);
		else this.events.delete(op.id);
	}
	invert(op) {
		this.apply(require_history.invertWriteOp(op));
	}
	writeCtx() {
		return {
			getEvents: () => this.getEvents(),
			getEvent: (id) => this.getEvent(id),
			config: this.config
		};
	}
	apiCtx() {
		return {
			write: (input, reason) => this.write(input, reason),
			project: (viewport) => this.project(viewport),
			getEvents: () => this.getEvents(),
			getEvent: (id) => this.getEvent(id),
			config: this.config
		};
	}
	mergeApi(module) {
		const contributed = module.api?.(this.apiCtx());
		if (!contributed) return;
		const api = this.api;
		for (const [key, value] of Object.entries(contributed)) {
			if (key in api) throw new Error(`Kernel: module "${module.name}" contributes api "${key}", which another mounted module already contributes. Rename one of them.`);
			api[key] = value;
		}
	}
	assertRequires() {
		const mounted = new Set(this.modules.map((module) => module.name));
		for (const module of this.modules) {
			const missing = (module.requires ?? []).filter((name) => !mounted.has(name));
			if (missing.length > 0) throw new Error(`Kernel: module "${module.name}" requires ${missing.map((name) => `"${name}"`).join(", ")}, which ${missing.length === 1 ? "is" : "are"} not mounted.`);
		}
	}
};

//#endregion
exports.Kernel = Kernel;
exports.createKernel = createKernel;
//# sourceMappingURL=kernel.cjs.map