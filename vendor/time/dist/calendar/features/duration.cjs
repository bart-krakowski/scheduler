const require_parse = require('../../date/parse/parse.cjs');
const require_duration = require('../../kernel/modules/duration.cjs');

//#region src/calendar/features/duration.ts
function eventDurationFeature() {
	const spanOf = (event, newStart, newEnd) => ({
		start: newStart ?? require_parse.toPlainDateTimeString(event.start),
		end: newEnd ?? require_parse.toPlainDateTimeString(event.end)
	});
	return {
		name: "duration",
		module: (ctx) => require_duration.durationModule({
			resources: () => ctx.getResources(),
			workingTime: () => ctx.getWorkingTime()
		}),
		api: (_host, module) => ({
			getWorkingDuration: (event, newStart, newEnd) => module.getWorkingDuration({
				...spanOf(event, newStart, newEnd),
				resources: event.resources,
				calendarId: event.calendarId
			}),
			checkEventDuration: (event, newStart, newEnd, newResources) => module.evaluateDuration({
				id: event.id,
				title: event.title,
				...spanOf(event, newStart, newEnd),
				resources: newResources ?? event.resources,
				calendarId: event.calendarId,
				duration: event.duration,
				effort: event.effort
			})
		})
	};
}

//#endregion
exports.eventDurationFeature = eventDurationFeature;
//# sourceMappingURL=duration.cjs.map