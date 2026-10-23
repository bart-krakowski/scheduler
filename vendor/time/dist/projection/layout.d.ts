//#region src/projection/layout.d.ts
interface LayoutInputEvent {
  id: string;
  start: string | Date | number;
  end: string | Date | number;
}
interface OverlapInfo {
  id: string;
  index: number;
  startFraction: number;
  endFraction: number;
  durationFraction: number;
  overlapping: Array<string>;
  concurrency: number;
  depth: number;
  cluster: number;
  clusterSize: number;
  clusterDepth: number;
  clusterConcurrency: number;
  column: number;
  columnCount: number;
  columnSpan: number;
}
interface CrossPlacement {
  crossStart: number;
  crossSize: number;
  zIndex?: number;
}
type EventLayout = OverlapInfo & CrossPlacement;
type LayoutStrategyFn = (info: OverlapInfo) => CrossPlacement;
type OverlapStrategy = 'columns' | 'expand' | 'cascade';
interface LayoutOptions {
  strategy?: OverlapStrategy | LayoutStrategyFn;
  cascadeOffset?: number;
  minCrossSize?: number;
}
type LayoutOrientation = 'vertical' | 'horizontal';
interface LayoutStyle {
  top: string;
  height: string;
  left: string;
  width: string;
  zIndex?: number;
}
declare function analyzeOverlaps(events: Array<LayoutInputEvent>): Array<OverlapInfo>;
declare const columnsStrategy: LayoutStrategyFn;
declare const expandStrategy: LayoutStrategyFn;
declare const cascadeStrategy: (options?: Pick<LayoutOptions, "cascadeOffset" | "minCrossSize">) => LayoutStrategyFn;
declare function layoutDaySegments(events: Array<LayoutInputEvent>, options?: LayoutOptions): Array<EventLayout>;
declare function toLayoutStyle(layout: EventLayout, orientation?: LayoutOrientation): LayoutStyle;
//#endregion
export { CrossPlacement, EventLayout, LayoutInputEvent, LayoutOptions, LayoutOrientation, LayoutStrategyFn, LayoutStyle, OverlapInfo, OverlapStrategy, analyzeOverlaps, cascadeStrategy, columnsStrategy, expandStrategy, layoutDaySegments, toLayoutStyle };
//# sourceMappingURL=layout.d.ts.map