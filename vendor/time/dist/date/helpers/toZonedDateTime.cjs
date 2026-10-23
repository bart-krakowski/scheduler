const require_validateDate = require('../validateDate.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/date/helpers/toZonedDateTime.ts
function toZonedDateTime(input, timeZone, calendar) {
	if (input instanceof _js_temporal_polyfill.Temporal.ZonedDateTime) return input;
	let dateString;
	if (typeof input === "string") {
		if (input.includes("[") && input.includes("]")) return _js_temporal_polyfill.Temporal.ZonedDateTime.from(input);
		dateString = require_validateDate.validateDate({ date: input }).toISOString();
	} else if (typeof input === "number") dateString = require_validateDate.validateDate({ date: input }).toISOString();
	else if (input instanceof Date) dateString = require_validateDate.validateDate({ date: input }).toISOString();
	else throw new Error(`Invalid date input type: ${typeof input}`);
	const zonedDateTimeString = `${dateString}[${timeZone}][u-ca=${calendar}]`;
	return _js_temporal_polyfill.Temporal.ZonedDateTime.from(zonedDateTimeString);
}

//#endregion
exports.toZonedDateTime = toZonedDateTime;
//# sourceMappingURL=toZonedDateTime.cjs.map