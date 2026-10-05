import { between, compileSchedule, merge, weekday } from '@tanstack/time';
import type { SlotResource, SlotRule, WorkingCalendar } from '@tanstack/time';

export const TIME_ZONE = 'Europe/Warsaw';

export const calendars: Array<WorkingCalendar> = [
  compileSchedule({
    id: 'business-hours',
    timeZone: TIME_ZONE,
    on: [
      merge(
        weekday('monday', 'tuesday', 'wednesday', 'thursday', 'friday'),
        between('09:00', '17:00'),
      ),
    ],
  }),
];

export const resources: Array<SlotResource> = [{ id: 'host-1' }];

export const slotRules: Array<SlotRule> = [
  {
    id: 'intro-call',
    calendarId: 'business-hours',
    duration: 30,
    bufferAfter: 10,
    minNotice: 120,
    maxHorizon: 30,
    resourceIds: ['host-1'],
  },
];
