import { toZonedDateTime } from "../helpers/toZonedDateTime.js";
import { resolveOptions, toInstantDate } from "../withDateOperation/withDateOperation.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/date/clamp/clamp.ts
function clamp(input, options) {
	const resolved = resolveOptions(options);
	const { range: { start, end } } = options;
	const zdt = toZonedDateTime(input, resolved.timeZone, resolved.calendar);
	const startZdt = toZonedDateTime(start, resolved.timeZone, resolved.calendar);
	const endZdt = toZonedDateTime(end, resolved.timeZone, resolved.calendar);
	if (Temporal.ZonedDateTime.compare(zdt, startZdt) < 0) return toInstantDate(startZdt);
	if (Temporal.ZonedDateTime.compare(zdt, endZdt) > 0) return toInstantDate(endZdt);
	return toInstantDate(zdt);
}

//#endregion
export { clamp };
//# sourceMappingURL=clamp.js.map