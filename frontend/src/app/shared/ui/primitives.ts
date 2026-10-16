import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type StatusTone = 'neutral' | 'info' | 'active' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="ws-header">
      <div>
        @if (eyebrow()) { <p class="ws-eyebrow">{{ eyebrow() }}</p> }
        <h1>{{ heading() }}</h1>
        @if (intro()) { <span class="ws-header__intro">{{ intro() }}</span> }
      </div>
      <div class="ws-header__actions"><ng-content></ng-content></div>
    </header>
  `,
})
export class PageHeaderComponent {
  readonly eyebrow = input('');
  readonly heading = input.required<string>();
  readonly intro = input('');
}

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span [class]="'status status--' + tone()">{{ label() }}</span>`,
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input<StatusTone>('neutral');
}

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="ws-row-flex" style="flex-wrap: nowrap">
      <div class="progress-track" role="progressbar" [attr.aria-label]="label()" [attr.aria-valuenow]="clamped()" aria-valuemin="0" aria-valuemax="100">
        <span [style.width.%]="clamped()"></span>
      </div>
      @if (showValue()) { <span class="ws-xs ws-muted" style="min-width: 2.5rem; text-align: right">{{ clamped() }}%</span> }
    </div>
  `,
})
export class ProgressBarComponent {
  readonly value = input(0);
  readonly label = input('Progress');
  readonly showValue = input(true);
  protected readonly clamped = computed(() => Math.max(0, Math.min(100, Math.round(this.value()))));
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="empty-state" [attr.role]="tone() === 'error' ? 'alert' : null">
      <h2>{{ heading() }}</h2>
      @if (message()) { <p>{{ message() }}</p> }
      @if (actionLabel() && actionLink()) { <a class="button button--primary" [routerLink]="actionLink()">{{ actionLabel() }}</a> }
      <ng-content></ng-content>
    </section>
  `,
})
export class EmptyStateComponent {
  readonly heading = input.required<string>();
  readonly message = input('');
  readonly actionLabel = input('');
  readonly actionLink = input<string | readonly unknown[] | null>(null);
  readonly tone = input<'empty' | 'error'>('empty');
}

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="ws-stack" [attr.aria-label]="label()" aria-busy="true" role="status">
      @for (row of rows(); track $index) { <div class="skeleton" [style.height.rem]="height()"></div> }
    </div>
  `,
})
export class SkeletonComponent {
  readonly lines = input(3);
  readonly height = input(5);
  readonly label = input('Loading');
  protected readonly rows = computed(() => Array.from({ length: this.lines() }));
}

@Component({
  selector: 'app-metric-card',
  standalone: true,
  template: `
    <article class="ws-metric" [attr.data-tone]="tone()">
      <p>{{ label() }}</p><strong>{{ value() }}</strong>@if (context()) { <span>{{ context() }}</span> }
    </article>
  `,
})
export class MetricCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly context = input('');
  readonly tone = input<'brand' | 'progress' | 'warm' | 'danger' | 'neutral'>('neutral');
}

export interface BarDatum {
  label: string;
  value: number;
  max?: number;
  tone?: 'progress' | 'brand' | 'warm';
}

/** Accessible bar chart: the data list itself is the text alternative. */
@Component({
  selector: 'app-bar-list',
  standalone: true,
  template: `
    <dl class="ws-bars" [attr.aria-label]="label()">
      @for (item of data(); track item.label) {
        <div class="ws-bar" [attr.data-tone]="item.tone ?? 'progress'">
          <dt>{{ item.label }}</dt>
          <dd><div class="progress-track" aria-hidden="true"><span [style.width.%]="percent(item)"></span></div></dd>
          <dd class="ws-bar__value">{{ item.value }}{{ unit() }}</dd>
        </div>
      }
    </dl>
  `,
})
export class BarListComponent {
  readonly data = input.required<readonly BarDatum[]>();
  readonly label = input('Chart data');
  readonly unit = input('');
  private readonly maxValue = computed(() => Math.max(1, ...this.data().map((item) => item.max ?? item.value)));
  protected percent(item: BarDatum): number {
    return Math.round((item.value / (item.max ?? this.maxValue())) * 100);
  }
}

export const UI_PRIMITIVES = [
  PageHeaderComponent,
  StatusBadgeComponent,
  ProgressBarComponent,
  EmptyStateComponent,
  SkeletonComponent,
  MetricCardComponent,
  BarListComponent,
] as const;
