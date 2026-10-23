import { Temporal } from "@js-temporal/polyfill";
//#region src/calendar/getResizeProps.d.ts
type ResizeEdge = 'top' | 'bottom' | 'left' | 'right';
interface UnavailableTimeRange {
  startMinutes: number;
  endMinutes: number;
}
interface ResizeConstraints {
  minDurationMinutes?: number;
  snapToMinutes?: number;
  unavailableRanges?: Array<UnavailableTimeRange>;
}
interface CalculateResizedEventOptions {
  originalStart: string;
  originalEnd: string;
  edge: ResizeEdge;
  deltaMinutes: number;
  timeZone: Temporal.TimeZoneLike;
  constraints?: ResizeConstraints;
}
interface ResizedEventResult {
  start: string;
  end: string;
  durationMinutes: number;
}
declare function calculateResizedEvent(options: CalculateResizedEventOptions): ResizedEventResult;
declare function calculateDeltaMinutesFromPixels(deltaPixels: number, containerHeight: number, minutesInDay?: number): number;
declare function calculateDeltaMinutesFromPixelsHorizontal(deltaPixels: number, containerWidth: number, totalMinutesInView: number): number;
interface ResizeHandleStyle {
  position: 'absolute';
  left: number;
  right: number;
  height: string;
  cursor: 'ns-resize';
  zIndex: number;
  top?: number;
  bottom?: number;
}
declare function getResizeHandleStyle(edge: ResizeEdge): ResizeHandleStyle;
interface SegmentInfo {
  isFirstSegment: boolean;
  isLastSegment: boolean;
  isSplitEvent: boolean;
  originalStart: string;
  originalEnd: string;
  segmentStart: string;
  segmentEnd: string;
}
declare function getSegmentInfo(event: {
  start: string;
  end: string;
  _originalStart?: string;
  _originalEnd?: string;
}): SegmentInfo;
interface PositionStyle {
  top: string;
  height: string;
}
interface SegmentResizePreview {
  shouldHide: boolean;
  previewStyle: PositionStyle | null;
  hasChanged: boolean;
}
interface ResizePreviewOptions {
  dayDate: string;
  originalStart: string;
  originalEnd: string;
  previewStart: string;
  previewEnd: string;
}
declare function calculateSegmentResizePreview(options: ResizePreviewOptions): SegmentResizePreview;
interface GhostPreviewOptions {
  dayDate: string;
  previewStart: string;
  previewEnd: string;
}
declare function calculateGhostPreviewStyle(options: GhostPreviewOptions): PositionStyle | null;
interface TimelineResizePreviewOptions {
  previewStart: string;
  previewEnd: string;
  firstDayIso: string;
  totalDays: number;
}
interface TimelineResizePreviewStyle {
  left: string;
  width: string;
}
declare function calculateTimelineResizePreview(options: TimelineResizePreviewOptions): TimelineResizePreviewStyle;
declare function isMultiDayEvent(start: string, end: string): boolean;
interface EventTimeRange {
  start: string;
  end: string;
  isMultiDay: boolean;
}
declare function getEventDisplayTimeRange(options: {
  originalStart: string;
  originalEnd: string;
  isBeingResized?: boolean;
  previewStart?: string;
  previewEnd?: string;
}): EventTimeRange;
interface FormatEventTimeOptions {
  locale?: string;
  alwaysShowDate?: boolean;
}
interface FormattedEventTime {
  startFormatted: string;
  endFormatted: string;
  rangeFormatted: string;
  isMultiDay: boolean;
}
declare function formatEventTimeRange(start: string, end: string, options?: FormatEventTimeOptions): FormattedEventTime;
//#endregion
export { EventTimeRange, FormatEventTimeOptions, FormattedEventTime, GhostPreviewOptions, PositionStyle, ResizeConstraints, ResizeEdge, ResizeHandleStyle, ResizePreviewOptions, SegmentInfo, SegmentResizePreview, TimelineResizePreviewOptions, TimelineResizePreviewStyle, UnavailableTimeRange, calculateDeltaMinutesFromPixels, calculateDeltaMinutesFromPixelsHorizontal, calculateGhostPreviewStyle, calculateResizedEvent, calculateSegmentResizePreview, calculateTimelineResizePreview, formatEventTimeRange, getEventDisplayTimeRange, getResizeHandleStyle, getSegmentInfo, isMultiDayEvent };
//# sourceMappingURL=getResizeProps.d.ts.map