import { DatePipe } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../core/notifications/notification.service';
import { GradingSubmission, InstructorGateway } from '../../../data-access/contracts/instructor.contracts';
import { EmptyStateComponent, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent } from '../../../shared/ui/primitives';

const TEMPLATES = [
  'Clear and well-structured. ',
  'Strong reasoning; add evidence for each claim. ',
  'Review the lesson on idempotency before resubmitting. ',
];

@Component({
  selector: 'app-grading',
  standalone: true,
  imports: [DatePipe, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent, EmptyStateComponent],
  templateUrl: './grading.html',
})
export class GradingComponent implements OnInit {
  protected readonly queue = signal<readonly GradingSubmission[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly statusFilter = signal<'open' | 'returned' | 'all'>('open');
  protected readonly blind = signal(false);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly scores = signal<Record<string, number>>({});
  protected readonly feedback = signal('');
  protected readonly dirty = signal(false);
  protected readonly templates = TEMPLATES;
  protected readonly visible = computed(() => this.queue().filter((item) => this.statusFilter() === 'all' || (this.statusFilter() === 'returned' ? item.status === 'returned' : item.status !== 'returned')));
  protected readonly selected = computed(() => this.queue().find((item) => item.id === this.selectedId()) ?? null);
  protected readonly total = computed(() => Object.values(this.scores()).reduce((sum, value) => sum + value, 0));
  protected readonly max = computed(() => this.selected()?.rubric.reduce((sum, item) => sum + item.points, 0) ?? 0);
  protected readonly complete = computed(() => !!this.selected() && this.selected()!.rubric.every((criterion) => this.scores()[criterion.id] !== undefined));
  private readonly gateway = inject(InstructorGateway);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.gateway.listGradingQueue().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((queue) => {
      this.queue.set(queue);
      this.loading.set(false);
      const first = this.visible()[0];
      if (first) this.open(first);
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  protected guardUnload(event: BeforeUnloadEvent): void {
    if (this.dirty()) event.preventDefault();
  }

  @HostListener('document:keydown', ['$event'])
  protected shortcuts(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (!event.altKey || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.step(event.key === 'ArrowDown' ? 1 : -1);
    }
  }

  protected learnerName(item: GradingSubmission, index: number): string {
    return this.blind() ? `Learner ${String.fromCharCode(65 + index)}` : item.learner;
  }

  protected open(item: GradingSubmission): void {
    if (this.dirty() && !window.confirm('You have unsaved feedback. Discard it and open another submission?')) return;
    this.selectedId.set(item.id);
    this.scores.set({ ...item.scores });
    this.feedback.set(item.feedback);
    this.dirty.set(false);
  }

  protected step(offset: 1 | -1): void {
    const list = this.visible();
    const index = list.findIndex((item) => item.id === this.selectedId());
    const next = list[index + offset];
    if (next) this.open(next);
  }

  protected score(criterionId: string, points: number): void {
    this.scores.update((scores) => ({ ...scores, [criterionId]: points }));
    this.dirty.set(true);
  }

  protected setFeedback(value: string): void {
    this.feedback.set(value);
    this.dirty.set(true);
  }

  protected insertTemplate(template: string): void {
    this.setFeedback(this.feedback() + template);
  }

  protected save(release: boolean): void {
    const item = this.selected();
    if (!item || this.saving()) return;
    if (release && !window.confirm(`Return grade ${this.total()}/${this.max()} to ${item.learner}? The learner will be notified.`)) return;
    this.saving.set(true);
    this.gateway.saveGrade(item.id, this.scores(), this.feedback(), release).pipe(finalize(() => this.saving.set(false))).subscribe((updated) => {
      this.queue.update((queue) => queue.map((entry) => (entry.id === updated.id ? updated : entry)));
      this.dirty.set(false);
      this.notifications.show(release ? 'Grade returned to learner' : 'Feedback draft saved', { tone: 'success' });
      if (release) this.step(1);
    });
  }
}
