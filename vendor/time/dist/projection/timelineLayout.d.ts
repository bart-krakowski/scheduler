//#region src/projection/timelineLayout.d.ts
interface TimelineSpanEvent {
  id: string;
  start: string | Date | number;
  end: string | Date | number;
}
interface TimelineSpanLayout {
  index: number;
  id: string;
  startFraction: number;
  endFraction: number;
  durationFraction: number;
  lane: number;
  isStartClipped: boolean;
  isEndClipped: boolean;
}
interface TimelineRangeInput<E extends TimelineSpanEvent> {
  events: Array<E>;
  firstDay: string;
  totalDays: number;
}
interface TimelineRangeLayout {
  items: Array<TimelineSpanLayout>;
  laneCount: number;
}
declare function layoutTimelineRange<E extends TimelineSpanEvent>(input: TimelineRangeInput<E>): TimelineRangeLayout;
declare function currentTimeFraction(input: {
  isoDates: Array<string>;
  now: {
    isoDate: string;
    hour: number;
    minute: number;
  };
}): number | null;
//#endregion
export { TimelineRangeInput, TimelineRangeLayout, TimelineSpanEvent, TimelineSpanLayout, currentTimeFraction, layoutTimelineRange };
//# sourceMappingURL=timelineLayout.d.ts.map