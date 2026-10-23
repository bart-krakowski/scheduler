const require_parse = require('../date/parse/parse.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/projection/layout.ts
const MINUTES_IN_DAY = 1440;
const DEFAULT_CASCADE_OFFSET = .2;
const DEFAULT_MIN_CROSS_SIZE = .3;
const minutesOfDay = (input) => {
	const dt = _js_temporal_polyfill.Temporal.PlainDateTime.from(require_parse.toPlainDateTimeString(input));
	return dt.hour * 60 + dt.minute + dt.second / 60;
};
const toFraction = (minutes) => Math.min(1, Math.max(0, minutes / MINUTES_IN_DAY));
const toInterval = (event, index) => {
	const startMinutes = minutesOfDay(event.start);
	const rawEnd = minutesOfDay(event.end);
	return {
		index,
		id: event.id,
		startMinutes,
		endMinutes: rawEnd < startMinutes ? MINUTES_IN_DAY : rawEnd
	};
};
const compareIntervals = (a, b) => {
	if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
	if (a.endMinutes !== b.endMinutes) return b.endMinutes - a.endMinutes;
	if (a.id !== b.id) return a.id < b.id ? -1 : 1;
	return a.index - b.index;
};
const overlaps = (a, b) => a.startMinutes < b.endMinutes && a.endMinutes > b.startMinutes;
const assignColumns = (cluster) => {
	const columnEnds = [];
	return cluster.map((interval) => {
		let column = columnEnds.findIndex((end) => end <= interval.startMinutes);
		if (column === -1) column = columnEnds.length;
		columnEnds[column] = interval.endMinutes;
		return {
			interval,
			column
		};
	});
};
const columnSpanOf = (placed, cluster, columnCount) => {
	let span = 1;
	while (placed.column + span < columnCount) {
		if (cluster.some((other) => other.column === placed.column + span && overlaps(other.interval, placed.interval))) break;
		span++;
	}
	return span;
};
const toClusters = (intervals) => {
	const clusters = [];
	let current = [];
	let clusterEnd = -Infinity;
	for (const interval of intervals) {
		if (interval.startMinutes >= clusterEnd && current.length > 0) {
			clusters.push(current);
			current = [];
			clusterEnd = -Infinity;
		}
		current.push(interval);
		clusterEnd = Math.max(clusterEnd, interval.endMinutes);
	}
	if (current.length > 0) clusters.push(current);
	return clusters;
};
function analyzeOverlaps(events) {
	const intervals = events.map(toInterval).sort(compareIntervals);
	const infos = Array.from({ length: events.length });
	toClusters(intervals).forEach((cluster, clusterIndex) => {
		const placed = assignColumns(cluster);
		const columnCount = placed.reduce((max, item) => Math.max(max, item.column + 1), 1);
		const overlapping = cluster.map((interval) => cluster.filter((other) => other !== interval && overlaps(other, interval)));
		const depths = cluster.map((interval, i) => overlapping[i].reduce((count, other) => compareIntervals(other, interval) < 0 ? count + 1 : count, 0));
		const clusterDepth = depths.reduce((max, d) => Math.max(max, d), 0);
		const clusterConcurrency = overlapping.reduce((max, list) => Math.max(max, list.length + 1), 1);
		placed.forEach((item, i) => {
			infos[item.interval.index] = {
				id: item.interval.id,
				index: item.interval.index,
				startFraction: toFraction(item.interval.startMinutes),
				endFraction: toFraction(item.interval.endMinutes),
				durationFraction: toFraction(Math.max(0, item.interval.endMinutes - item.interval.startMinutes)),
				overlapping: overlapping[i].map((other) => other.id),
				concurrency: overlapping[i].length + 1,
				depth: depths[i],
				cluster: clusterIndex,
				clusterSize: cluster.length,
				clusterDepth,
				clusterConcurrency,
				column: item.column,
				columnCount,
				columnSpan: columnSpanOf(item, placed, columnCount)
			};
		});
	});
	return infos;
}
const columnsStrategy = (info) => ({
	crossStart: info.column / info.columnCount,
	crossSize: 1 / info.columnCount
});
const expandStrategy = (info) => ({
	crossStart: info.column / info.columnCount,
	crossSize: info.columnSpan / info.columnCount
});
const cascadeStrategy = (options = {}) => {
	const offset = options.cascadeOffset ?? DEFAULT_CASCADE_OFFSET;
	const minCrossSize = options.minCrossSize ?? DEFAULT_MIN_CROSS_SIZE;
	return (info) => {
		const step = info.clusterDepth === 0 ? 0 : Math.min(offset, (1 - minCrossSize) / info.clusterDepth);
		return {
			crossStart: info.depth * step,
			crossSize: 1 - info.depth * step,
			zIndex: info.depth
		};
	};
};
const resolveStrategy = (options) => {
	if (typeof options.strategy === "function") return options.strategy;
	if (options.strategy === "expand") return expandStrategy;
	if (options.strategy === "cascade") return cascadeStrategy(options);
	return columnsStrategy;
};
function layoutDaySegments(events, options = {}) {
	const strategy = resolveStrategy(options);
	return analyzeOverlaps(events).map((info) => ({
		...info,
		...strategy(info)
	}));
}
const percent = (value) => `${value * 100}%`;
function toLayoutStyle(layout, orientation = "vertical") {
	const timeStart = percent(layout.startFraction);
	const timeSize = percent(layout.durationFraction);
	const crossStart = percent(layout.crossStart);
	const crossSize = percent(layout.crossSize);
	const stacking = layout.zIndex === void 0 ? {} : { zIndex: layout.zIndex };
	if (orientation === "horizontal") return {
		left: timeStart,
		width: timeSize,
		top: crossStart,
		height: crossSize,
		...stacking
	};
	return {
		top: timeStart,
		height: timeSize,
		left: crossStart,
		width: crossSize,
		...stacking
	};
}

//#endregion
exports.analyzeOverlaps = analyzeOverlaps;
exports.cascadeStrategy = cascadeStrategy;
exports.columnsStrategy = columnsStrategy;
exports.expandStrategy = expandStrategy;
exports.layoutDaySegments = layoutDaySegments;
exports.toLayoutStyle = toLayoutStyle;
//# sourceMappingURL=layout.cjs.map