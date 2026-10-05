import { toCivil } from './civil-time';

describe('toCivil', () => {
  it('renders the wall-clock time in the given zone', () => {
    expect(toCivil(new Date('2026-06-01T07:30:00Z'), 'Europe/Warsaw')).toBe(
      '2026-06-01T09:30:00',
    );
  });

  it('follows the zone offset across DST', () => {
    expect(toCivil(new Date('2026-01-15T08:00:00Z'), 'Europe/Warsaw')).toBe(
      '2026-01-15T09:00:00',
    );
  });
});
