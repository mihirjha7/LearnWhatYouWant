import { formatRemaining, isAnswered, timerState } from './attempt-utils';

describe('attempt-utils', () => {
  it('detects answered responses across question shapes', () => {
    expect(isAnswered(null)).toBeFalse();
    expect(isAnswered(undefined)).toBeFalse();
    expect(isAnswered('  ')).toBeFalse();
    expect(isAnswered('b')).toBeTrue();
    expect(isAnswered([])).toBeFalse();
    expect(isAnswered(['a'])).toBeTrue();
    expect(isAnswered({})).toBeFalse();
    expect(isAnswered({ l1: 'r1' })).toBeTrue();
  });

  it('formats remaining time with tabular minutes and seconds', () => {
    expect(formatRemaining(0)).toBe('00:00');
    expect(formatRemaining(61_000)).toBe('01:01');
    expect(formatRemaining(3_725_000)).toBe('1:02:05');
    expect(formatRemaining(-500)).toBe('00:00');
  });

  it('raises timer emphasis only at the defined thresholds', () => {
    expect(timerState(10 * 60_000)).toBe('normal');
    expect(timerState(5 * 60_000)).toBe('low');
    expect(timerState(60_000)).toBe('critical');
  });
});
