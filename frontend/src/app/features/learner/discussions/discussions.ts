import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../core/notifications/notification.service';
import { DiscussionThread, LearningActivityGateway } from '../../../data-access/contracts/learning-activity.contracts';
import { EmptyStateComponent, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent } from '../../../shared/ui/primitives';

@Component({
  selector: 'app-discussions',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="ws-page">
      <app-page-header eyebrow="Community" heading="Discussions" intro="Ask questions, share approaches, and learn from accepted answers.">
        <button type="button" class="button button--primary" (click)="composing.set(!composing())" [attr.aria-expanded]="composing()">New question</button>
      </app-page-header>

      @if (composing()) {
        <form class="ws-card" [formGroup]="newThread" (ngSubmit)="create()" aria-label="Ask a question">
          <label class="ws-field"><span>Course</span><select formControlName="course">@for (course of courses(); track course) { <option>{{ course }}</option> }</select></label>
          <label class="ws-field"><span>Title</span><input formControlName="title" maxlength="140" /></label>
          <label class="ws-field"><span>Details</span><textarea rows="4" formControlName="body"></textarea><small>Do not post assessment answers or personal information.</small></label>
          <div class="ws-row-flex"><button class="button" type="button" (click)="composing.set(false)">Cancel</button><button class="button button--primary" type="submit" [disabled]="newThread.invalid">Post question</button></div>
        </form>
      }

      <div class="ws-toolbar" role="search">
        <label class="ws-field"><span>Search</span><input type="search" [value]="query()" (input)="query.set($any($event.target).value)" placeholder="Search titles and replies" /></label>
        <label class="ws-field"><span>Course</span><select (change)="course.set($any($event.target).value)"><option value="">All courses</option>@for (c of courses(); track c) { <option [value]="c">{{ c }}</option> }</select></label>
        <label class="ws-check"><input type="checkbox" (change)="unansweredOnly.set($any($event.target).checked)" /> Unanswered only</label>
      </div>

      @if (loading()) { <app-skeleton [lines]="3" label="Loading discussions"></app-skeleton> }
      @else {
        <div class="ws-split ws-split--left">
          <div class="ws-card ws-card--flush" role="list" aria-label="Threads">
            @for (thread of filtered(); track thread.id) {
              <button type="button" role="listitem" class="ws-item" [class.active]="selectedId() === thread.id" [attr.aria-current]="selectedId() === thread.id" (click)="selectedId.set(thread.id)">
                <span class="ws-item__body" style="padding: 0.5rem">
                  <span class="ws-xs">{{ thread.pinned ? 'Pinned · ' : '' }}{{ thread.courseTitle }}</span>
                  <strong>{{ thread.title }}</strong>
                  <small>{{ thread.replies.length }} replies · {{ thread.answered ? 'Answered' : 'Open' }}</small>
                </span>
              </button>
            } @empty { <app-empty-state heading="No matching threads" message="Try a different search or ask a new question."></app-empty-state> }
          </div>

          @if (selected(); as thread) {
            <article class="ws-stack" aria-labelledby="thread-title">
              <section class="ws-card">
                <div class="ws-spread"><span class="ws-eyebrow">{{ thread.courseTitle }}</span>@if (thread.answered) { <app-status-badge label="Answered" tone="success"></app-status-badge> }</div>
                <h2 id="thread-title">{{ thread.title }}</h2>
                <p>{{ thread.body }}</p>
                <small class="ws-muted">{{ thread.author }} · {{ thread.createdAt | date: 'MMM d, h:mm a' }}</small>
                <div class="ws-chips">@for (tag of thread.tags; track tag) { <span class="ws-chip">#{{ tag }}</span> }</div>
              </section>
              @for (reply of thread.replies; track reply.id) {
                <section class="ws-card" [style.border-left]="reply.accepted ? '4px solid var(--success)' : null">
                  <div class="ws-spread">
                    <strong>{{ reply.author }} <span class="ws-chip">{{ reply.role }}</span></strong>
                    @if (reply.accepted) { <app-status-badge label="Accepted answer" tone="success"></app-status-badge> }
                  </div>
                  <p>{{ reply.body }}</p>
                  <div class="ws-spread">
                    <small class="ws-muted">{{ reply.createdAt | date: 'MMM d, h:mm a' }} · {{ reply.helpfulCount }} found helpful</small>
                    <button type="button" class="button button--sm button--quiet" (click)="report(thread.id, reply.id)">Report</button>
                  </div>
                </section>
              }
              <form class="ws-card" [formGroup]="replyForm" (ngSubmit)="reply(thread.id)">
                <label class="ws-field"><span>Your reply</span><textarea rows="4" formControlName="body"></textarea><small>Mention someone with &#64;name. Be kind and specific.</small></label>
                <div class="ws-row-flex"><button type="submit" class="button button--primary" [disabled]="replyForm.invalid || posting()">{{ posting() ? 'Posting…' : 'Post reply' }}</button></div>
              </form>
            </article>
          } @else {
            <app-empty-state heading="Select a thread" message="Choose a conversation to read replies."></app-empty-state>
          }
        </div>
      }
    </div>
  `,
})
export class DiscussionsComponent implements OnInit {
  protected readonly threads = signal<readonly DiscussionThread[]>([]);
  protected readonly loading = signal(true);
  protected readonly posting = signal(false);
  protected readonly composing = signal(false);
  protected readonly query = signal('');
  protected readonly course = signal('');
  protected readonly unansweredOnly = signal(false);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly courses = computed(() => [...new Set(this.threads().map((thread) => thread.courseTitle))]);
  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    return [...this.threads()]
      .filter((thread) => !this.course() || thread.courseTitle === this.course())
      .filter((thread) => !this.unansweredOnly() || !thread.answered)
      .filter((thread) => !query || [thread.title, thread.body, ...thread.replies.map((reply) => reply.body)].some((text) => text.toLowerCase().includes(query)))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
  });
  protected readonly selected = computed(() => this.threads().find((thread) => thread.id === this.selectedId()) ?? null);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly replyForm = this.fb.group({ body: ['', [Validators.required, Validators.minLength(2)]] });
  protected readonly newThread = this.fb.group({ course: [''], title: ['', [Validators.required, Validators.minLength(8)]], body: ['', Validators.required] });
  private readonly gateway = inject(LearningActivityGateway);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.gateway.listThreads().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((threads) => {
      this.threads.set(threads);
      this.selectedId.set(threads[0]?.id ?? null);
      this.newThread.controls.course.setValue(threads[0]?.courseTitle ?? '');
      this.loading.set(false);
    });
  }

  protected reply(threadId: string): void {
    if (this.replyForm.invalid) return;
    this.posting.set(true);
    this.gateway.reply(threadId, this.replyForm.getRawValue().body).subscribe((reply) => {
      this.threads.update((threads) => threads.map((thread) => thread.id === threadId ? { ...thread, replies: [...thread.replies, reply] } : thread));
      this.replyForm.reset();
      this.posting.set(false);
    });
  }

  protected create(): void {
    const value = this.newThread.getRawValue();
    this.gateway.createThread(value.title, value.body, value.course).subscribe((thread) => {
      this.threads.update((threads) => [thread, ...threads]);
      this.selectedId.set(thread.id);
      this.composing.set(false);
      this.newThread.reset({ course: value.course, title: '', body: '' });
      this.notifications.show('Question posted', { tone: 'success' });
    });
  }

  protected report(threadId: string, replyId: string): void {
    this.gateway.reportReply(threadId, replyId, 'learner-report').subscribe(() =>
      this.notifications.show('Reported to moderators', { detail: 'Thank you. A moderator will review this reply.', tone: 'info' }),
    );
  }
}
