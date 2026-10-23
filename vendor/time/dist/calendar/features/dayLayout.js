import { toPlainDateTimeString } from "../../date/parse/parse.js";
import { getEventProps } from "../getEventProps.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/calendar/features/dayLayout.ts
function dayEventLayoutFeature() {
	const daySegments = (host, event) => {
		const isoDate = toPlainDateTimeString(event.start).slice(0, 10);
		const nextDay = Temporal.PlainDate.from(isoDate).add({ days: 1 }).toString({ calendarName: "never" });
		return host.getEventMap({
			start: isoDate,
			end: nextDay
		}).get(isoDate) ?? [];
	};
	return {
		name: "dayLayout",
		api: (host) => ({ getEventProps: (event, layoutOptions) => {
			const options = host.getOptions();
			return getEventProps(host.getEventMap(), event, host.getState(), {
				timeZone: options.timeZone,
				...options.layout,
				...layoutOptions,
				daySegments: daySegments(host, event)
			});
		} })
	};
}

//#endregion
export { dayEventLayoutFeature };
//# sourceMappingURL=dayLayout.js.map