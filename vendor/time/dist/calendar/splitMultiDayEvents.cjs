const require_splitMultiDay = require('../projection/splitMultiDay.cjs');

//#region src/calendar/splitMultiDayEvents.ts
const splitMultiDayEvents = (event, timeZone) => require_splitMultiDay.splitMultiDay(event, timeZone);

//#endregion
exports.splitMultiDayEvents = splitMultiDayEvents;
//# sourceMappingURL=splitMultiDayEvents.cjs.map