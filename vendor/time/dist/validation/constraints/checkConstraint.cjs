let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/validation/constraints/checkConstraint.ts
const CONSTRAINT_ANCHOR = {
	"start-no-earlier-than": "start",
	"start-no-later-than": "start",
	"must-start-on": "start",
	"finish-no-earlier-than": "finish",
	"finish-no-later-than": "finish",
	"must-finish-on": "finish"
};
const REASON = {
	"start-no-earlier-than": "cannot start before",
	"start-no-later-than": "cannot start after",
	"finish-no-earlier-than": "cannot finish before",
	"finish-no-later-than": "cannot finish after",
	"must-start-on": "must start on",
	"must-finish-on": "must finish on"
};
function isDateOnlyConstraint(value) {
	return !value.includes("T");
}
function compareCivil(anchor, date) {
	return isDateOnlyConstraint(date) ? _js_temporal_polyfill.Temporal.PlainDate.compare(_js_temporal_polyfill.Temporal.PlainDateTime.from(anchor).toPlainDate(), _js_temporal_polyfill.Temporal.PlainDate.from(date)) : _js_temporal_polyfill.Temporal.PlainDateTime.compare(_js_temporal_polyfill.Temporal.PlainDateTime.from(anchor), _js_temporal_polyfill.Temporal.PlainDateTime.from(date));
}
function satisfies(type, comparison) {
	switch (type) {
		case "start-no-earlier-than":
		case "finish-no-earlier-than": return comparison >= 0;
		case "start-no-later-than":
		case "finish-no-later-than": return comparison <= 0;
		case "must-start-on":
		case "must-finish-on": return comparison === 0;
	}
}
function checkConstraint(event) {
	const { constraint } = event;
	if (!constraint) return null;
	const anchor = CONSTRAINT_ANCHOR[constraint.type];
	const anchorValue = anchor === "start" ? event.start : event.end;
	if (satisfies(constraint.type, compareCivil(anchorValue, constraint.date))) return null;
	return {
		eventId: event.id ?? "",
		eventTitle: event.title,
		type: constraint.type,
		date: constraint.date,
		anchor,
		message: `"${event.title}" ${REASON[constraint.type]} ${constraint.date} (${constraint.type})`,
		start: event.start,
		end: event.end
	};
}

//#endregion
exports.CONSTRAINT_ANCHOR = CONSTRAINT_ANCHOR;
exports.checkConstraint = checkConstraint;
exports.isDateOnlyConstraint = isDateOnlyConstraint;
//# sourceMappingURL=checkConstraint.cjs.map