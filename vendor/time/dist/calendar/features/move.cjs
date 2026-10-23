const require_getMoveProps = require('../getMoveProps.cjs');
const require_moveController = require('../moveController.cjs');

//#region src/calendar/features/move.ts
function eventMoveFeature() {
	return {
		name: "move",
		requires: ["recurrence"],
		api: (host, _module, peers) => {
			const findEvent = (eventId) => host.getEvent(eventId) ?? host.getEvents().find((event) => event.id === eventId);
			const resolveMasterEventId = (eventId) => {
				const event = findEvent(eventId);
				return event ? peers.recurrence.getMasterEvent(event).id : eventId;
			};
			const validateEventMove = (options) => {
				const { eventId, originalStart, originalEnd, originalDayDate, targetDayDate, minuteShift, granularity, constraints } = options;
				const timeZone = host.getOptions().timeZone;
				const unmoved = require_getMoveProps.calculateMovedEvent({
					originalStart,
					originalEnd,
					timeZone,
					granularity,
					constraints
				});
				const result = require_getMoveProps.calculateMovedEvent({
					originalStart,
					originalEnd,
					dayShift: require_getMoveProps.calculateDayShift(originalDayDate, targetDayDate),
					minuteShift,
					granularity,
					timeZone,
					constraints
				});
				if (!result.moved) return {
					blocked: false,
					result,
					targetDayDate
				};
				const event = findEvent(eventId);
				const masterId = event ? peers.recurrence.getMasterEvent(event).id : eventId;
				const check = host.validateMove(masterId, result.start, result.end, event?.resources, event?.consumption);
				if (!check.blocked) return {
					blocked: false,
					result,
					targetDayDate
				};
				const conflict = event ? peers.availability?.checkEventAvailability(event, result.start, result.end) : null;
				return {
					blocked: true,
					error: {
						reason: "unavailable-time",
						message: check.message ?? "This move is blocked.",
						eventTitle: check.blockedEventTitle,
						conflicts: conflict ? [conflict] : []
					},
					result: unmoved,
					targetDayDate: originalDayDate
				};
			};
			return {
				createMoveController: (options = {}) => new require_moveController.MoveController({
					...host,
					validateEventMove,
					resolveMasterEventId,
					editRecurringEvent: peers.recurrence.editRecurringEvent
				}, options),
				validateEventMove
			};
		}
	};
}

//#endregion
exports.eventMoveFeature = eventMoveFeature;
//# sourceMappingURL=move.cjs.map