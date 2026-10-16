import { Component, DestroyRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, debounceTime, finalize, interval, retry, switchMap, timer } from 'rxjs';
import { OnlineStatusService } from '../../core/network/online-status.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { AssessmentGateway, Attempt, ResponseValue } from '../../data-access/contracts/assessment.contracts';
import { EmptyStateComponent, SkeletonComponent } from '../../shared/ui/primitives';
import { formatRemaining, isAnswered, timerState } from './attempt-utils';
import { QuestionRendererComponent } from './question-renderer';

type SaveState = 'saved' | 'saving' | 'unsaved' | 'retrying';

interface LocalDraft {
  baseVersion: number;
  dirty: boolean;
  responses: Record<string, ResponseValue>;
  flagged: string[];
}

@Component({
  selector: 'app-attempt-shell',
  standalone: true,
  imports: [RouterLink, QuestionRendererComponent, SkeletonComponent, EmptyStateComponent],
  templateUrl: './attempt-shell.html',
})
export class AttemptShellComponent implements OnInit {
  protected readonly attempt = signal<Attempt | null>(null);
  protected readonly loading = signal(true);
  protected readonly responses = signal<Record<string, ResponseValue>>({});
  protected readonly flagged = signal<readonly string[]>([]);
  protected readonly index = signal(0);
  protected readonly reviewing = signal(false);
  protected readonly confirming = signal(false);
  protected readonly submitting = signal(false);
  protected readonly navOpen = signal(false);
  protected readonly saveState = signal<SaveState>('saved');
  protected readonly remainingMs = signal(0);
  protected readonly announcement = signal('');
  protected readonly network = inject(OnlineStatusService);

  protected readonly questions = computed(() => this.attempt()?.questions ?? []);
  protected readonly current = computed(() => this.questions()[this.index()] ?? null);
  protected readonly unanswered = computed(() => this.questions().filter((question) => !isAnswered(this.responses()[question.id])));
  protected readonly timerLabel = computed(() => formatRemaining(this.remainingMs()));
  protected readonly timerState = computed(() => timerState(this.remainingMs()));
  protected readonly isAnswered = isAnswered;

  private readonly gateway = inject(AssessmentGateway);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changes = new Subject<void>();
  private readonly announced = new Set<string>();
  private version = 0;

  ngOnInit(): void {
    const attemptId = this.route.snapshot.paramMap.get('attemptId') ?? '';
    this.gateway.getAttempt(attemptId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (attempt) => this.initialise(attempt),
      error: () => this.loading.set(false),
    });

    this.changes
      .pipe(
        debounceTime(1200),
        switchMap(() => {
          this.saveState.set('saving');
          return this.gateway.saveResponses(attemptId, this.responses(), this.flagged()).pipe(
            retry({ count: 4, delay: (_error, count) => { this.saveState.set('retrying'); return timer(Math.min(8000, 1000 * 2 ** count)); } }),
            catchError(() => {
              this.saveState.set('unsaved');
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ version }) => {
        this.version = version;
        this.saveState.set('saved');
        this.writeLocal(false);
      });
  }

  @HostListener('window:beforeunload', ['$event'])
  protected warnBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.attempt()?.status === 'active' && this.saveState() !== 'saved') event.preventDefault();
  }

  protected setResponse(questionId: string, value: ResponseValue): void {
    this.responses.update((responses) => ({ ...responses, [questionId]: value }));
    this.markChanged();
  }

  protected toggleFlag(questionId: string): void {
    this.flagged.update((flags) => (flags.includes(questionId) ? flags.filter((id) => id !== questionId) : [...flags, questionId]));
    this.markChanged();
  }

  protected go(index: number): void {
    this.index.set(Math.max(0, Math.min(this.questions().length - 1, index)));
    this.reviewing.set(false);
    this.navOpen.set(false);
  }

  protected next(): void {
    if (this.index() >= this.questions().length - 1) this.reviewing.set(true);
    else this.go(this.index() + 1);
  }

  protected requestSubmit(): void {
    this.reviewing.set(true);
    this.confirming.set(true);
  }

  protected submit(): void {
    const attempt = this.attempt();
    if (!attempt || this.submitting()) return;
    this.submitting.set(true);
    this.gateway
      .saveResponses(attempt.id, this.responses(), this.flagged())
      .pipe(
        switchMap(() => this.gateway.submitAttempt(attempt.id, this.idempotencyKey(attempt.id))),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.clearLocal();
          this.saveState.set('saved');
          void this.router.navigate(['/learn/attempts', attempt.id, 'result']);
        },
        error: () => this.notifications.show('Submission not confirmed yet', { detail: 'Your answers are saved on this device. Try again when the connection is stable.', tone: 'warning' }),
      });
  }

  private initialise(attempt: Attempt): void {
    if (attempt.status !== 'active') {
      void this.router.navigate(['/learn/attempts', attempt.id, 'result'], { replaceUrl: true });
      return;
    }
    this.attempt.set(attempt);
    this.version = attempt.version;
    const local = this.readLocal(attempt.id);
    if (local?.dirty && local.baseVersion >= attempt.version) {
      this.responses.set(local.responses);
      this.flagged.set(local.flagged);
      this.markChanged();
      this.notifications.show('Recovered unsaved answers from this device', { tone: 'info' });
    } else {
      this.responses.set({ ...attempt.responses });
      this.flagged.set([...attempt.flagged]);
    }
    this.loading.set(false);
    this.tick();
    interval(1000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.tick());
  }

  private tick(): void {
    const attempt = this.attempt();
    if (!attempt) return;
    const remaining = Math.max(0, Date.parse(attempt.deadlineAt) - Date.now());
    this.remainingMs.set(remaining);
    for (const [threshold, label] of [[300_000, '5 minutes remaining.'], [60_000, '1 minute remaining.']] as const) {
      if (remaining <= threshold && remaining > 0 && !this.announced.has(label)) {
        this.announced.add(label);
        this.announcement.set(label);
      }
    }
    if (remaining === 0 && !this.submitting() && !this.announced.has('expired')) {
      this.announced.add('expired');
      this.announcement.set('Time is up. Submitting your saved answers.');
      this.submit();
    }
  }

  private markChanged(): void {
    this.saveState.set('unsaved');
    this.writeLocal(true);
    this.changes.next();
  }

  private idempotencyKey(attemptId: string): string {
    const key = `learnova_submit_${attemptId}`;
    try {
      const existing = window.sessionStorage.getItem(key);
      if (existing) return existing;
      const created = crypto.randomUUID();
      window.sessionStorage.setItem(key, created);
      return created;
    } catch {
      return `${attemptId}-submit`;
    }
  }

  private readLocal(attemptId: string): LocalDraft | null {
    try {
      const raw = window.localStorage.getItem(`learnova_attempt_${attemptId}`);
      return raw ? (JSON.parse(raw) as LocalDraft) : null;
    } catch {
      return null;
    }
  }

  private writeLocal(dirty: boolean): void {
    const attempt = this.attempt();
    if (!attempt) return;
    try {
      const draft: LocalDraft = { baseVersion: this.version, dirty, responses: this.responses(), flagged: [...this.flagged()] };
      window.localStorage.setItem(`learnova_attempt_${attempt.id}`, JSON.stringify(draft));
    } catch {
      // Server autosave remains the source of truth.
    }
  }

  private clearLocal(): void {
    const attempt = this.attempt();
    try {
      if (attempt) window.localStorage.removeItem(`learnova_attempt_${attempt.id}`);
    } catch {
      // Nothing to clear.
    }
  }
}
