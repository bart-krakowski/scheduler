import { withDateOperation } from "../withDateOperation/withDateOperation.js";

//#region src/date/startOf/startOf.ts
function startOf(input, options) {
	return withDateOperation((zdt, { unit }) => {
		switch (unit) {
			case "year": return zdt.with({
				month: 1,
				day: 1,
				hour: 0,
				minute: 0,
				second: 0,
				millisecond: 0,
				microsecond: 0,
				nanosecond: 0
			});
			case "month": return zdt.with({
				day: 1,
				hour: 0,
				minute: 0,
				second: 0,
				millisecond: 0,
				microsecond: 0,
				nanosecond: 0
			});
			case "week": {
				const daysToSubtract = (zdt.dayOfWeek - 1 + 7) % 7;
				return zdt.subtract({ days: daysToSubtract });
			}
			case "day": return zdt.with({
				hour: 0,
				minute: 0,
				second: 0,
				millisecond: 0,
				microsecond: 0,
				nanosecond: 0
			});
			case "hour": return zdt.with({
				minute: 0,
				second: 0,
				millisecond: 0,
				microsecond: 0,
				nanosecond: 0
			});
			case "minute": return zdt.with({
				second: 0,
				millisecond: 0,
				microsecond: 0,
				nanosecond: 0
			});
			case "second": return zdt.with({
				millisecond: 0,
				microsecond: 0,
				nanosecond: 0
			});
			case "millisecond": return zdt.with({
				microsecond: 0,
				nanosecond: 0
			});
			default: return zdt;
		}
	})(input, options);
}

//#endregion
export { startOf };
//# sourceMappingURL=startOf.js.map