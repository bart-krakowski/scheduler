import { validateDate } from "../validateDate.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/date/helpers/toZonedDateTime.ts
function toZonedDateTime(input, timeZone, calendar) {
	if (input instanceof Temporal.ZonedDateTime) return input;
	let dateString;
	if (typeof input === "string") {
		if (input.includes("[") && input.includes("]")) return Temporal.ZonedDateTime.from(input);
		dateString = validateDate({ date: input }).toISOString();
	} else if (typeof input === "number") dateString = validateDate({ date: input }).toISOString();
	else if (input instanceof Date) dateString = validateDate({ date: input }).toISOString();
	else throw new Error(`Invalid date input type: ${typeof input}`);
	const zonedDateTimeString = `${dateString}[${timeZone}][u-ca=${calendar}]`;
	return Temporal.ZonedDateTime.from(zonedDateTimeString);
}

//#endregion
export { toZonedDateTime };
//# sourceMappingURL=toZonedDateTime.js.map