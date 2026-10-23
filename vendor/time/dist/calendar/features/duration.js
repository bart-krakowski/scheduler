import { toPlainDateTimeString } from "../../date/parse/parse.js";
import { durationModule } from "../../kernel/modules/duration.js";

//#region src/calendar/features/duration.ts
function eventDurationFeature() {
	const spanOf = (event, newStart, newEnd) => ({
		start: newStart ?? toPlainDateTimeString(event.start),
		end: newEnd ?? toPlainDateTimeString(event.end)
	});
	return {
		name: "duration",
		module: (ctx) => durationModule({
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
export { eventDurationFeature };
//# sourceMappingURL=duration.js.map