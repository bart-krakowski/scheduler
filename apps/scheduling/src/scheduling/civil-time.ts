const civilFormatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = civilFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    civilFormatters.set(timeZone, formatter);
  }
  return formatter;
}

export function toCivil(instant: Date, timeZone: string): string {
  return formatterFor(timeZone).format(instant).replace(' ', 'T');
}
