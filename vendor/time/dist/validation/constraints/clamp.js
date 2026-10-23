import { CONSTRAINT_ANCHOR, isDateOnlyConstraint } from "./checkConstraint.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/validation/constraints/clamp.ts
const DIRECTION = {
	"start-no-earlier-than": "forward",
	"finish-no-earlier-than": "forward",
	"start-no-later-than": "backward",
	"finish-no-later-than": "backward",
	"must-start-on": "exact",
	"must-finish-on": "exact"
};
function shifts(type, delta) {
	switch (DIRECTION[type]) {
		case "forward": return delta > 0;
		case "backward": return delta < 0;
		case "exact": return delta !== 0;
	}
}
function shiftSpan(span, amount) {
	return {
		start: Temporal.PlainDateTime.from(span.start).add(amount).toString({ smallestUnit: "second" }),
		end: Temporal.PlainDateTime.from(span.end).add(amount).toString({ smallestUnit: "second" })
	};
}
function clampToConstraint(span, constraint) {
	if (!constraint) return span;
	const anchorValue = CONSTRAINT_ANCHOR[constraint.type] === "start" ? span.start : span.end;
	const anchor = Temporal.PlainDateTime.from(anchorValue);
	if (isDateOnlyConstraint(constraint.date)) {
		const days = anchor.toPlainDate().until(Temporal.PlainDate.from(constraint.date)).days;
		return shifts(constraint.type, days) ? shiftSpan(span, { days }) : span;
	}
	const milliseconds = anchor.until(Temporal.PlainDateTime.from(constraint.date), { largestUnit: "millisecond" }).total({ unit: "millisecond" });
	return shifts(constraint.type, milliseconds) ? shiftSpan(span, { milliseconds }) : span;
}

//#endregion
export { clampToConstraint };
//# sourceMappingURL=clamp.js.map