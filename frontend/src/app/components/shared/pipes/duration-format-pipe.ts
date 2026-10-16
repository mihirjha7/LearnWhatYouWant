import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationFormat'
})
export class DurationFormatPipe implements PipeTransform {
  transform(duration?: number): string {
    if (!duration) return '—';
    if (duration < 60) return `${duration} min`;

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  }
}