import { Day, Event, Resource } from "./types.cjs";
//#region src/calendar/groupDaysBy.d.ts
interface GroupDaysByBaseProps<TResource extends Resource, TEvent extends Event<TResource> = Event<TResource>> {
  days: Array<Day<TResource, TEvent> | null>;
  weekStartsOn: number;
  locale: string;
  calendar?: string;
}
type GroupDaysByMonthProps<TResource extends Resource, TEvent extends Event<TResource> = Event<TResource>> = GroupDaysByBaseProps<TResource, TEvent> & {
  unit: 'month';
  fillMissingDays?: never;
};
type GroupDaysByWeekProps<TResource extends Resource, TEvent extends Event<TResource> = Event<TResource>> = GroupDaysByBaseProps<TResource, TEvent> & {
  unit: 'week' | 'workWeek';
  fillMissingDays?: boolean;
};
type GroupDaysByProps<TResource extends Resource, TEvent extends Event<TResource> = Event<TResource>> = GroupDaysByMonthProps<TResource, TEvent> | GroupDaysByWeekProps<TResource, TEvent>;
declare const groupDaysBy: <TResource extends Resource, TEvent extends Event<TResource> = Event<TResource>>({ days, unit, fillMissingDays, weekStartsOn, locale, calendar }: GroupDaysByProps<TResource, TEvent>) => Array<Array<Day<TResource, TEvent> | null>>;
//#endregion
export { GroupDaysByProps, groupDaysBy };
//# sourceMappingURL=groupDaysBy.d.cts.map