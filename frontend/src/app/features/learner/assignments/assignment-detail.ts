import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, catchError, debounceTime, finalize, switchMap, tap } from 'rxjs';
import { NotificationService } from '../../../core/notifications/notification.service';
import { AssignmentDetail, LearningActivityGateway, SubmissionFile } from '../../../data-access/contracts/learning-activity.contracts';
import { EmptyStateComponent, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent } from '../../../shared/ui/primitives';
import { ASSIGNMENT_STATUS } from './assignment-list';

const MAX_FILE_MB = 20;
const ALLOWED = ['.pdf', '.md', '.docx', '.zip', '.png', '.jpg', '.txt'];

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, ReactiveFormsModule, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent, EmptyStateComponent],
  templateUrl: './assignment-detail.html',
})
export class AssignmentDetailComponent implements OnInit {
  protected readonly assignment = signal<AssignmentDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly saveLabel = signal('');
  protected readonly submitting = signal(false);
  protected readonly confirming = signal(false);
  protected readonly files = signal<readonly SubmissionFile[]>([]);
  protected readonly fileError = signal('');
  protected readonly status = ASSIGNMENT_STATUS;
  protected readonly form = inject(FormBuilder).nonNullable.group({
    text: [''],
    link: ['', Validators.pattern(/^https:\/\/[^\s]+$/)],
  });
  protected readonly canEdit = computed(() => {
    const status = this.assignment()?.status;
    return status === 'not-started' || status === 'draft' || status === 'resubmission-requested';
  });
  protected readonly totalPoints = computed(() => this.assignment()?.rubric.reduce((sum, item) => sum + item.points, 0) ?? 0);
  private readonly gateway = inject(LearningActivityGateway);
  private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private idempotencyKey = crypto.randomUUID();

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('assignmentId') ?? '';
    this.gateway.getAssignment(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (assignment) => this.apply(assignment),
      error: () => this.loading.set(false),
    });

    this.form.valueChanges
      .pipe(
        tap(() => this.saveLabel.set('Unsaved changes')),
        debounceTime(1500),
        switchMap(() => {
          this.saveLabel.set('Saving draft…');
          return this.gateway.saveAssignmentDraft(id, this.draft()).pipe(catchError(() => { this.saveLabel.set('Draft not saved — will retry on next change'); return EMPTY; }));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ savedAt }) => this.saveLabel.set(`Draft saved ${new Date(savedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`));
  }

  protected criterionScore(criterionId: string): { score: number; comment: string } | undefined {
    return this.assignment()?.feedback?.scores.find((item) => item.criterionId === criterionId);
  }

  protected addFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError.set('');
    const accepted: SubmissionFile[] = [];
    for (const file of Array.from(input.files ?? [])) {
      const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
      if (!ALLOWED.includes(extension)) { this.fileError.set(`${file.name}: file type not accepted.`); continue; }
      if (file.size > MAX_FILE_MB * 1024 * 1024) { this.fileError.set(`${file.name}: larger than ${MAX_FILE_MB} MB.`); continue; }
      accepted.push({ name: file.name, sizeKb: Math.max(1, Math.round(file.size / 1024)), scanStatus: 'pending' });
    }
    this.files.update((files) => [...files, ...accepted]);
    input.value = '';
    this.form.markAsDirty();
    this.form.updateValueAndValidity();
  }

  protected removeFile(name: string): void {
    this.files.update((files) => files.filter((file) => file.name !== name));
    this.form.updateValueAndValidity();
  }

  protected submit(): void {
    const assignment = this.assignment();
    if (!assignment || this.submitting() || this.form.invalid) return;
    const draft = this.draft();
    if (!draft.text.trim() && !draft.link && !draft.files.length) {
      this.notifications.show('Add a response before submitting', { tone: 'warning' });
      this.confirming.set(false);
      return;
    }
    this.submitting.set(true);
    this.gateway.submitAssignment(assignment.id, draft, this.idempotencyKey).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (updated) => {
        this.idempotencyKey = crypto.randomUUID();
        this.confirming.set(false);
        this.apply(updated);
        this.notifications.show('Submission received', { detail: 'Files are being scanned before your instructor can open them.', tone: 'success' });
      },
      error: () => this.notifications.show('Submission not confirmed', { detail: 'Your draft is preserved. Try again shortly.', tone: 'warning' }),
    });
  }

  private draft(): AssignmentDetail['draft'] {
    const value = this.form.getRawValue();
    return { text: value.text, link: value.link.trim(), files: this.files() };
  }

  private apply(assignment: AssignmentDetail): void {
    this.assignment.set(assignment);
    this.form.reset({ text: assignment.draft.text, link: assignment.draft.link }, { emitEvent: false });
    this.files.set(assignment.draft.files);
    this.saveLabel.set(assignment.draft.savedAt ? `Draft saved ${new Date(assignment.draft.savedAt).toLocaleString()}` : '');
    this.loading.set(false);
  }
}
