import { ResponseValue } from '../../data-access/contracts/assessment.contracts';

export function isAnswered(value: ResponseValue | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Object.keys(value).length > 0;
}

export function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/** Timer emphasis increases only at defined thresholds and never flashes. */
export function timerState(ms: number): 'normal' | 'low' | 'critical' {
  if (ms <= 60_000) return 'critical';
  if (ms <= 300_000) return 'low';
  return 'normal';
}
