import { toPlainDateTimeString } from "../date/parse/parse.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/recurrence/expandRecurringEvent.ts
function expandRecurringEvent(event, windowStart, windowEnd) {
	const rule = event.recurrence;
	if (!rule) return [];
	const masterStartStr = toPlainDateTimeString(event.start);
	const masterEndStr = toPlainDateTimeString(event.end);
	const masterStart = Temporal.PlainDateTime.from(masterStartStr);
	const masterEnd = Temporal.PlainDateTime.from(masterEndStr);
	const durationMs = masterStart.toZonedDateTime("UTC").until(masterEnd.toZonedDateTime("UTC")).total("milliseconds");
	const interval = Math.max(1, rule.interval ?? 1);
	const windowStartDate = Temporal.PlainDate.from(windowStart);
	const windowEndDate = Temporal.PlainDate.from(windowEnd);
	const untilDate = rule.until ? Temporal.PlainDate.from(rule.until) : null;
	const frequency = rule.frequency;
	const byWeekday = frequency === "weekly" ? (rule.byWeekday?.length ? rule.byWeekday : [masterStart.dayOfWeek]).filter((day) => day >= 1 && day <= 7).filter((day, index, all) => all.indexOf(day) === index).sort((a, b) => a - b) : null;
	const exDateTimes = /* @__PURE__ */ new Set();
	const exDates = /* @__PURE__ */ new Set();
	for (const exDate of rule.exDates ?? []) if (typeof exDate === "string" && !exDate.includes("T")) exDates.add(Temporal.PlainDate.from(exDate).toString({ calendarName: "never" }));
	else {
		const normalized = toPlainDateTimeString(exDate);
		exDateTimes.add(normalized);
		exDates.add(Temporal.PlainDateTime.from(normalized).toPlainDate().toString({ calendarName: "never" }));
	}
	const overridesByDateTime = /* @__PURE__ */ new Map();
	const overridesByDate = /* @__PURE__ */ new Map();
	for (const override of rule.overrides ?? []) {
		const originalStart = override.originalStart;
		if (typeof originalStart === "string" && !originalStart.includes("T")) overridesByDate.set(Temporal.PlainDate.from(originalStart).toString({ calendarName: "never" }), override);
		else {
			const normalized = toPlainDateTimeString(originalStart);
			overridesByDateTime.set(normalized, override);
			overridesByDate.set(Temporal.PlainDateTime.from(normalized).toPlainDate().toString({ calendarName: "never" }), override);
		}
	}
	const occurrences = [];
	let occurrenceIndex = 0;
	let step = 0;
	const MAX_STEPS = 3650;
	const masterMonday = masterStart.toPlainDate().subtract({ days: masterStart.dayOfWeek - 1 });
	const toDateTimeOnMasterTime = (date) => Temporal.PlainDateTime.from({
		year: date.year,
		month: date.month,
		day: date.day,
		hour: masterStart.hour,
		minute: masterStart.minute,
		second: masterStart.second
	});
	const addDuration = (start) => Temporal.PlainDateTime.from(start).toZonedDateTime("UTC").add({ milliseconds: durationMs }).toPlainDateTime().toString({ smallestUnit: "second" });
	while (step <= MAX_STEPS) {
		const candidates = [];
		switch (frequency) {
			case "daily":
				candidates.push(masterStart.add({ days: step * interval }));
				break;
			case "weekly": {
				const targetMonday = masterMonday.add({ weeks: step * interval });
				if (step === 0) candidates.push(masterStart);
				for (const targetWeekday of byWeekday ?? [masterStart.dayOfWeek]) {
					const targetDate = targetMonday.add({ days: targetWeekday - 1 });
					candidates.push(toDateTimeOnMasterTime(targetDate));
				}
				break;
			}
			case "monthly":
				candidates.push(addSafeMonths(masterStart, step * interval));
				break;
			case "yearly":
				candidates.push(addSafeMonths(masterStart, step * interval * 12));
				break;
			default: candidates.push(masterStart.add({ days: step * interval }));
		}
		const uniqueCandidates = Array.from(new Map(candidates.filter((candidate) => Temporal.PlainDateTime.compare(candidate, masterStart) >= 0).sort(Temporal.PlainDateTime.compare).map((candidate) => [candidate.toString({ smallestUnit: "second" }), candidate])).values());
		for (const candidateStart of uniqueCandidates) {
			const candidateDate = candidateStart.toPlainDate();
			const candidateDateStr = candidateDate.toString({ calendarName: "never" });
			if (untilDate && Temporal.PlainDate.compare(candidateDate, untilDate) >= 0) return occurrences;
			if (!untilDate && rule.count !== void 0 && occurrenceIndex >= rule.count) return occurrences;
			const originalStartStr = candidateStart.toString({ smallestUnit: "second" });
			const originalEndStr = addDuration(originalStartStr);
			const override = overridesByDateTime.get(originalStartStr) ?? overridesByDate.get(candidateDateStr);
			if (!(exDateTimes.has(originalStartStr) || exDates.has(candidateDateStr))) {
				const generatedId = occurrenceIndex === 0 ? event.id : `${event.id}_${occurrenceIndex}`;
				const overrideStart = override?.start;
				const overrideEnd = override?.end;
				const occurrenceStartStr = overrideStart != null ? toPlainDateTimeString(overrideStart) : originalStartStr;
				const occurrenceEndStr = overrideEnd != null ? toPlainDateTimeString(overrideEnd) : overrideStart != null ? addDuration(occurrenceStartStr) : originalEndStr;
				const occurrenceStartDate = Temporal.PlainDateTime.from(occurrenceStartStr).toPlainDate();
				const occurrenceEnd = Temporal.PlainDateTime.from(occurrenceEndStr);
				const startsBeforeWindowEnd = Temporal.PlainDate.compare(occurrenceStartDate, windowEndDate) < 0;
				const endsAfterWindowStart = Temporal.PlainDate.compare(occurrenceStartDate, windowStartDate) >= 0 || Temporal.PlainDateTime.compare(occurrenceEnd, windowStartDate.toPlainDateTime()) > 0;
				if (startsBeforeWindowEnd && endsAfterWindowStart) {
					const overrideFields = override ? { ...override } : {};
					delete overrideFields.originalStart;
					delete overrideFields.id;
					delete overrideFields.start;
					delete overrideFields.end;
					occurrences.push({
						...event,
						...overrideFields,
						id: override?.id ?? generatedId,
						start: occurrenceStartStr,
						end: occurrenceEndStr,
						_recurringMasterId: event.id,
						_occurrenceIndex: occurrenceIndex,
						_occurrenceOriginalStart: originalStartStr,
						_originalStart: void 0,
						_originalEnd: void 0
					});
				}
			}
			occurrenceIndex++;
			if (Temporal.PlainDate.compare(candidateDate, windowEndDate) >= 0) return occurrences;
		}
		step++;
	}
	return occurrences;
}
function addSafeMonths(dt, months) {
	let year = dt.year;
	let month = dt.month + months;
	year += Math.floor((month - 1) / 12);
	month = (month - 1) % 12 + 1;
	const daysInMonth = Temporal.PlainDate.from({
		year,
		month,
		day: 1
	}).daysInMonth;
	const day = Math.min(dt.day, daysInMonth);
	return Temporal.PlainDateTime.from({
		year,
		month,
		day,
		hour: dt.hour,
		minute: dt.minute,
		second: dt.second
	});
}

//#endregion
export { expandRecurringEvent };
//# sourceMappingURL=expandRecurringEvent.js.map