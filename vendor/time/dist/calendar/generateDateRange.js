import { Temporal } from "@js-temporal/polyfill";

//#region src/calendar/generateDateRange.ts
const generateDateRange = (start, end) => {
	const startDate = Temporal.PlainDate.from(start);
	const endDate = Temporal.PlainDate.from(end);
	const dates = [];
	let current = startDate;
	while (Temporal.PlainDate.compare(current, endDate) <= 0) {
		dates.push(current);
		current = current.add({ days: 1 });
	}
	return dates;
};

//#endregion
export { generateDateRange };
//# sourceMappingURL=generateDateRange.js.map