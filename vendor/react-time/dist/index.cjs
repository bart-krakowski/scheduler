Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_useCalendar = require('./useCalendar/useCalendar.cjs');
let _tanstack_time = require("@tanstack/time");

Object.defineProperty(exports, 'calculateDayShift', {
  enumerable: true,
  get: function () {
    return _tanstack_time.calculateDayShift;
  }
});
Object.defineProperty(exports, 'calculateGhostPreviewStyle', {
  enumerable: true,
  get: function () {
    return _tanstack_time.calculateGhostPreviewStyle;
  }
});
Object.defineProperty(exports, 'calculateMovedEvent', {
  enumerable: true,
  get: function () {
    return _tanstack_time.calculateMovedEvent;
  }
});
Object.defineProperty(exports, 'calculateSegmentResizePreview', {
  enumerable: true,
  get: function () {
    return _tanstack_time.calculateSegmentResizePreview;
  }
});
Object.defineProperty(exports, 'calculateTimelineResizePreview', {
  enumerable: true,
  get: function () {
    return _tanstack_time.calculateTimelineResizePreview;
  }
});
Object.defineProperty(exports, 'formatEventTimeRange', {
  enumerable: true,
  get: function () {
    return _tanstack_time.formatEventTimeRange;
  }
});
Object.defineProperty(exports, 'getDateParts', {
  enumerable: true,
  get: function () {
    return _tanstack_time.getDateParts;
  }
});
Object.defineProperty(exports, 'getEventDisplayTimeRange', {
  enumerable: true,
  get: function () {
    return _tanstack_time.getEventDisplayTimeRange;
  }
});
Object.defineProperty(exports, 'getSegmentInfo', {
  enumerable: true,
  get: function () {
    return _tanstack_time.getSegmentInfo;
  }
});
Object.defineProperty(exports, 'isMultiDayEvent', {
  enumerable: true,
  get: function () {
    return _tanstack_time.isMultiDayEvent;
  }
});
exports.useCalendar = require_useCalendar.useCalendar;