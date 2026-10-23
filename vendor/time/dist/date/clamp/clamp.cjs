const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');
const require_withDateOperation = require('../withDateOperation/withDateOperation.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/date/clamp/clamp.ts
function clamp(input, options) {
	const resolved = require_withDateOperation.resolveOptions(options);
	const { range: { start, end } } = options;
	const zdt = require_toZonedDateTime.toZonedDateTime(input, resolved.timeZone, resolved.calendar);
	const startZdt = require_toZonedDateTime.toZonedDateTime(start, resolved.timeZone, resolved.calendar);
	const endZdt = require_toZonedDateTime.toZonedDateTime(end, resolved.timeZone, resolved.calendar);
	if (_js_temporal_polyfill.Temporal.ZonedDateTime.compare(zdt, startZdt) < 0) return require_withDateOperation.toInstantDate(startZdt);
	if (_js_temporal_polyfill.Temporal.ZonedDateTime.compare(zdt, endZdt) > 0) return require_withDateOperation.toInstantDate(endZdt);
	return require_withDateOperation.toInstantDate(zdt);
}

//#endregion
exports.clamp = clamp;
//# sourceMappingURL=clamp.cjs.map