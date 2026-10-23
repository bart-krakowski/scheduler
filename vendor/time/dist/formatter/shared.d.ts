//#region src/formatter/shared.d.ts
interface LocaleFormatterOptions {
  localeMatcher?: 'lookup' | 'best fit';
  calendar?: string;
  numberingSystem?: string;
  hour12?: boolean;
  hourCycle?: 'h11' | 'h12' | 'h23' | 'h24';
  timeZone?: string;
}
type FormatStyle = 'full' | 'long' | 'medium' | 'short';
type Locale = string | Intl.Locale | Array<string> | Array<Intl.Locale>;
interface DateFormatterOptions extends LocaleFormatterOptions {
  formatMatcher?: 'basic' | 'best fit';
  weekday?: 'narrow' | 'short' | 'long';
  era?: 'narrow' | 'short' | 'long';
  year?: '2-digit' | 'numeric';
  month?: '2-digit' | 'numeric' | 'narrow' | 'short' | 'long';
  day?: '2-digit' | 'numeric';
  dateStyle?: FormatStyle;
}
interface TimeFormatterOptions extends LocaleFormatterOptions {
  formatMatcher?: 'basic' | 'best fit';
  dayPeriod?: 'narrow' | 'short' | 'long';
  hour?: '2-digit' | 'numeric';
  minute?: '2-digit' | 'numeric';
  second?: '2-digit' | 'numeric';
  fractionalSecondDigits?: 1 | 2 | 3;
  timeZoneName?: 'short' | 'long' | 'shortOffset' | 'longOffset' | 'shortGeneric' | 'longGeneric';
  timeStyle?: FormatStyle;
}
interface DateTimeFormatterOptions extends DateFormatterOptions, TimeFormatterOptions {}
interface DateFormatterBuildParams {
  locale?: Locale;
  options?: FormatStyle | DateFormatterOptions;
}
interface TimeFormatterBuildParams {
  locale?: Locale;
  options?: FormatStyle | TimeFormatterOptions;
}
interface DateTimeFormatterBuildParams {
  locale?: Locale;
  options?: FormatStyle | DateTimeFormatterOptions;
}
//#endregion
export { DateFormatterBuildParams, DateFormatterOptions, DateTimeFormatterBuildParams, DateTimeFormatterOptions, Locale, TimeFormatterBuildParams, TimeFormatterOptions };
//# sourceMappingURL=shared.d.ts.map