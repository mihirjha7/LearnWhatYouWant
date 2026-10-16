import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../core/notifications/notification.service';
import { BankQuestion, InstructorGateway } from '../../../data-access/contracts/instructor.contracts';
import { PageHeaderComponent, SkeletonComponent, StatusBadgeComponent } from '../../../shared/ui/primitives';

@Component({
  selector: 'app-question-bank',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent],
  templateUrl: './question-bank.html',
})
export class QuestionBankComponent implements OnInit {
  protected readonly questions = signal<readonly BankQuestion[]>([]);
  protected readonly loading = signal(true);
  protected readonly view = signal<'bank' | 'builder'>('bank');
  protected readonly query = signal('');
  protected readonly typeFilter = signal('');
  protected readonly difficultyFilter = signal('');
  protected readonly statusFilter = signal('active');
  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly preview = signal<BankQuestion | null>(null);
  protected readonly assessmentItems = signal<readonly { id: string; points: number }[]>([]);
  protected readonly types = computed(() => [...new Set(this.questions().map((question) => question.type))]);
  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.questions().filter((question) =>
      (!this.typeFilter() || question.type === this.typeFilter()) &&
      (!this.difficultyFilter() || question.difficulty === this.difficultyFilter()) &&
      (!this.statusFilter() || question.status === this.statusFilter()) &&
      (!query || `${question.prompt} ${question.skill} ${question.tags.join(' ')}`.toLowerCase().includes(query)),
    );
  });
  protected readonly allSelected = computed(() => this.filtered().length > 0 && this.filtered().every((question) => this.selected().has(question.id)));
  protected readonly totalPoints = computed(() => this.assessmentItems().reduce((sum, item) => sum + item.points, 0) + this.settingsValue().poolCount * this.settingsValue().poolPoints);
  protected readonly builderIssues = computed(() => {
    const issues: string[] = [];
    const settings = this.settingsValue();
    if (!settings.title.trim()) issues.push('Add an assessment title.');
    if (this.assessmentItems().length + settings.poolCount === 0) issues.push('Add at least one fixed question or pool rule.');
    if (settings.passScore > 100 || settings.passScore < 1) issues.push('Pass score must be between 1 and 100.');
    const issuesFromBank = this.assessmentItems().map((item) => this.questions().find((question) => question.id === item.id)).filter((question) => question?.accessibilityIssue);
    if (issuesFromBank.length) issues.push(`${issuesFromBank.length} selected question(s) have accessibility issues.`);
    return issues;
  });

  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly settings = this.fb.group({
    title: ['', Validators.required],
    timeLimit: [20],
    attempts: [2],
    passScore: [70],
    randomize: [true],
    feedback: ['after-submission'],
    negativeMarking: [false],
    poolSkill: ['API reliability'],
    poolCount: [0],
    poolPoints: [1],
  });
  private readonly settingsValue = signal(this.settings.getRawValue());
  private readonly gateway = inject(InstructorGateway);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.gateway.listBankQuestions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((questions) => {
      this.questions.set(questions);
      this.loading.set(false);
    });
    this.settings.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.settingsValue.set(this.settings.getRawValue()));
  }

  protected toggle(id: string): void {
    this.selected.update((selected) => {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected clearSelection(): void {
    this.selected.set(new Set());
  }

  protected toggleAll(): void {
    this.selected.set(this.allSelected() ? new Set() : new Set(this.filtered().map((question) => question.id)));
  }

  protected bulk(change: { status?: BankQuestion['status']; tags?: string[] }, label: string): void {
    const ids = [...this.selected()];
    this.gateway.updateBankQuestions(ids, change).subscribe((questions) => {
      this.questions.set(questions);
      this.selected.set(new Set());
      this.notifications.show(`${label} ${ids.length} question(s)`, { tone: 'success' });
    });
  }

  protected tagSelected(tag: string): void {
    if (tag.trim()) this.bulk({ tags: [tag.trim().toLowerCase()] }, 'Tagged');
  }

  protected addSelectedToAssessment(): void {
    const existing = new Set(this.assessmentItems().map((item) => item.id));
    this.assessmentItems.update((items) => [...items, ...[...this.selected()].filter((id) => !existing.has(id)).map((id) => ({ id, points: 1 }))]);
    this.selected.set(new Set());
    this.view.set('builder');
  }

  protected setPoints(id: string, points: number): void {
    this.assessmentItems.update((items) => items.map((item) => (item.id === id ? { ...item, points: Math.max(0, points) } : item)));
  }

  protected removeItem(id: string): void {
    this.assessmentItems.update((items) => items.filter((item) => item.id !== id));
  }

  protected questionFor(id: string): BankQuestion | undefined {
    return this.questions().find((question) => question.id === id);
  }

  protected saveAssessment(publish: boolean): void {
    if (publish && this.builderIssues().length) return;
    this.notifications.show(publish ? 'Assessment published' : 'Assessment draft saved', { detail: `${this.totalPoints()} points total.`, tone: 'success' });
  }
}
