import { toZonedDateTime } from "../helpers/toZonedDateTime.js";
import { resolveOptions, toInstantDate } from "../withDateOperation/withDateOperation.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/date/range/range.ts
function range(options) {
	const { start, end, step } = options;
	const resolved = resolveOptions(options);
	const duration = Temporal.Duration.from(step);
	if (duration.blank) throw new Error("Step duration cannot be zero");
	const startZdt = toZonedDateTime(start, resolved.timeZone, resolved.calendar);
	const endZdt = toZonedDateTime(end, resolved.timeZone, resolved.calendar);
	const isForward = Temporal.ZonedDateTime.compare(startZdt, endZdt) <= 0;
	if (isForward !== (duration.sign === 1)) throw new Error(isForward ? "Step must be positive when start is before or equal to end" : "Step must be negative when start is after end");
	const result = [];
	let current = startZdt;
	while (duration.sign * Temporal.ZonedDateTime.compare(current, endZdt) <= 0) {
		result.push(toInstantDate(current));
		current = current.add(duration);
	}
	return result;
}

//#endregion
export { range };
//# sourceMappingURL=range.js.map