const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');
const require_withDateOperation = require('../withDateOperation/withDateOperation.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/date/range/range.ts
function range(options) {
	const { start, end, step } = options;
	const resolved = require_withDateOperation.resolveOptions(options);
	const duration = _js_temporal_polyfill.Temporal.Duration.from(step);
	if (duration.blank) throw new Error("Step duration cannot be zero");
	const startZdt = require_toZonedDateTime.toZonedDateTime(start, resolved.timeZone, resolved.calendar);
	const endZdt = require_toZonedDateTime.toZonedDateTime(end, resolved.timeZone, resolved.calendar);
	const isForward = _js_temporal_polyfill.Temporal.ZonedDateTime.compare(startZdt, endZdt) <= 0;
	if (isForward !== (duration.sign === 1)) throw new Error(isForward ? "Step must be positive when start is before or equal to end" : "Step must be negative when start is after end");
	const result = [];
	let current = startZdt;
	while (duration.sign * _js_temporal_polyfill.Temporal.ZonedDateTime.compare(current, endZdt) <= 0) {
		result.push(require_withDateOperation.toInstantDate(current));
		current = current.add(duration);
	}
	return result;
}

//#endregion
exports.range = range;
//# sourceMappingURL=range.cjs.map