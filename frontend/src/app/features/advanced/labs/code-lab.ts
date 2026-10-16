import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../core/notifications/notification.service';
import { AdvancedLearningGateway, LabDefinition, LabRunResult } from '../../../data-access/contracts/advanced-learning.contracts';
import { EmptyStateComponent, SkeletonComponent } from '../../../shared/ui/primitives';

@Component({
  selector: 'app-code-lab',
  standalone: true,
  imports: [RouterLink, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="ws-focus">
      <header class="ws-focus__bar">
        <a routerLink="/student/dashboard">&larr; Exit lab</a>
        @if (lab(); as l) { <strong>{{ l.title }}</strong><span class="ws-small ws-muted">{{ l.language }} · {{ l.timeLimitMinutes }} min sandbox</span> }
        <div class="ws-row-flex">
          <button type="button" class="button button--sm" (click)="reset()">Reset</button>
          <button type="button" class="button button--sm" (click)="snapshot()">Save snapshot</button>
          <button type="button" class="button button--sm" [disabled]="running()" (click)="run()">{{ running() ? 'Running…' : 'Run tests' }}</button>
          <button type="button" class="button button--primary button--sm" [disabled]="running() || submitted()" (click)="submit()">{{ submitted() ? 'Submitted' : 'Submit' }}</button>
        </div>
      </header>
      <div class="ws-focus__body">
        @if (loading()) { <app-skeleton [lines]="2" label="Provisioning lab environment"></app-skeleton> }
        @else if (lab(); as l) {
          <div class="ws-split ws-split--left">
            <aside class="ws-stack">
              <section class="ws-card" aria-labelledby="lab-instructions"><h1 id="lab-instructions" style="font-size: 1.25rem">Instructions</h1><ol class="ws-small">@for (step of l.instructions; track step) { <li>{{ step }}</li> }</ol><span class="ws-xs ws-muted">{{ l.course }}</span></section>
              <section class="ws-card" aria-labelledby="hints-title">
                <h2 id="hints-title" class="ws-card__title">Hints</h2>
                @for (hint of l.hints.slice(0, hintsShown()); track hint; let i = $index) { <p class="ws-small"><strong>Hint {{ i + 1 }}:</strong> {{ hint }}</p> }
                @if (hintsShown() < l.hints.length) { <button type="button" class="button button--sm" (click)="hintsShown.set(hintsShown() + 1)">Reveal hint {{ hintsShown() + 1 }} of {{ l.hints.length }}</button> }
              </section>
            </aside>
            <div class="ws-stack" style="min-width: 0">
              <label class="ws-field"><span>solution.ts</span>
                <textarea class="ws-code" rows="16" spellcheck="false" autocapitalize="off" [value]="code()" (input)="code.set($any($event.target).value)" (keydown)="handleTab($event)"></textarea>
                <small>Tab inserts two spaces. Press Esc, then Tab, to leave the editor.</small>
              </label>
              <section class="ws-card" aria-labelledby="output-title" aria-live="polite">
                <h2 id="output-title" class="ws-card__title">Test results</h2>
                @if (result(); as r) {
                  <ul class="ws-list">
                    @for (test of r.results; track test.testId) { <li><span [class]="test.passed ? 'status status--success' : 'status status--danger'">{{ test.passed ? 'Pass' : 'Fail' }}</span><span class="ws-item__body"><strong>{{ test.name }}</strong><span>{{ test.message }}</span></span></li> }
                    <li><span class="status status--info">Hidden</span><span class="ws-item__body"><strong>{{ r.hiddenSummary.passed }} of {{ r.hiddenSummary.total }} hidden tests passed</strong><span>Hidden test details are revealed after grading.</span></span></li>
                  </ul>
                  <pre class="ws-code">{{ r.output }}</pre>
                  <small class="ws-muted">Results here are for practice. Your submission is re-run on the server for grading.</small>
                } @else { <p class="ws-small ws-muted">Run the tests to see results. Code runs in an isolated server sandbox, never in your browser.</p> }
              </section>
            </div>
          </div>
        } @else { <app-empty-state tone="error" heading="Lab not available" message="The environment could not be provisioned. Try again shortly." actionLabel="Dashboard" actionLink="/student/dashboard"></app-empty-state> }
      </div>
    </div>
  `,
})
export class CodeLabComponent implements OnInit {
  protected readonly lab = signal<LabDefinition | null>(null);
  protected readonly loading = signal(true);
  protected readonly running = signal(false);
  protected readonly submitted = signal(false);
  protected readonly code = signal('');
  protected readonly result = signal<LabRunResult | null>(null);
  protected readonly hintsShown = signal(0);
  private readonly gateway = inject(AdvancedLearningGateway);
  private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly labId = this.route.snapshot.paramMap.get('labId') ?? '';

  ngOnInit(): void {
    this.gateway.getLab(this.labId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (lab) => {
        this.lab.set(lab);
        this.code.set(this.readSnapshot() ?? lab.starterCode);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected handleTab(event: KeyboardEvent): void {
    const target = event.target as HTMLTextAreaElement;
    if (event.key === 'Escape') { target.dataset['escaped'] = 'true'; return; }
    if (event.key !== 'Tab' || event.shiftKey) return;
    if (target.dataset['escaped'] === 'true') { target.dataset['escaped'] = ''; return; }
    event.preventDefault();
    const { selectionStart, selectionEnd, value } = target;
    target.value = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
    target.selectionStart = target.selectionEnd = selectionStart + 2;
    this.code.set(target.value);
  }

  protected run(): void {
    this.running.set(true);
    this.gateway.runLab(this.labId, this.code()).pipe(finalize(() => this.running.set(false))).subscribe((result) => this.result.set(result));
  }

  protected reset(): void {
    if (!window.confirm('Reset to the starter code? Your current code will be replaced.')) return;
    this.code.set(this.lab()?.starterCode ?? '');
    this.result.set(null);
  }

  protected snapshot(): void {
    try {
      window.localStorage.setItem(`learnova_lab_${this.labId}`, this.code());
      this.notifications.show('Snapshot saved on this device', { tone: 'success' });
    } catch {
      this.notifications.show('Snapshot could not be saved', { tone: 'warning' });
    }
  }

  protected submit(): void {
    this.running.set(true);
    this.gateway.runLab(this.labId, this.code()).pipe(finalize(() => this.running.set(false))).subscribe((result) => {
      this.result.set(result);
      this.submitted.set(true);
      this.notifications.show('Lab submitted for grading', { detail: 'Your final score is calculated on the server.', tone: 'success' });
    });
  }

  private readSnapshot(): string | null {
    try {
      return window.localStorage.getItem(`learnova_lab_${this.labId}`);
    } catch {
      return null;
    }
  }
}
