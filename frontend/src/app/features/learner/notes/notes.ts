import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../core/notifications/notification.service';
import { LearnerNote, LearningActivityGateway } from '../../../data-access/contracts/learning-activity.contracts';
import { EmptyStateComponent, PageHeaderComponent, SkeletonComponent } from '../../../shared/ui/primitives';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [DatePipe, PageHeaderComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="ws-page">
      <app-page-header eyebrow="Learner workspace" heading="Notes and bookmarks" intro="Private notes from every lesson, searchable and exportable.">
        <button type="button" class="button" (click)="export()" [disabled]="!notes().length">Export as Markdown</button>
      </app-page-header>
      <div class="ws-toolbar" role="search">
        <label class="ws-field"><span>Search notes</span><input type="search" [value]="query()" (input)="query.set($any($event.target).value)" /></label>
        <label class="ws-field"><span>Tag</span><select (change)="tag.set($any($event.target).value)"><option value="">All tags</option>@for (t of tags(); track t) { <option [value]="t">{{ t }}</option> }</select></label>
      </div>
      @if (undo(); as removed) {
        <div class="ws-banner" role="status"><span>Note deleted.</span><button type="button" class="button button--sm" (click)="restore(removed)">Undo</button></div>
      }
      @if (loading()) { <app-skeleton [lines]="3" label="Loading notes"></app-skeleton> }
      @else {
        <div class="ws-grid">
          @for (note of filtered(); track note.id) {
            <article class="ws-card">
              <span class="ws-eyebrow">{{ note.courseTitle }}</span>
              <h2 class="ws-card__title">{{ note.lessonTitle }}@if (note.timestamp) { <span class="ws-chip">&#9654; {{ note.timestamp }}</span> }</h2>
              @if (editingId() === note.id) {
                <label class="ws-field"><span class="sr-only">Edit note</span><textarea rows="5" #editor [value]="note.body"></textarea></label>
                <div class="ws-row-flex"><button type="button" class="button button--sm" (click)="editingId.set(null)">Cancel</button><button type="button" class="button button--primary button--sm" (click)="save(note, editor.value)">Save</button></div>
              } @else {
                <p style="white-space: pre-wrap">{{ note.body }}</p>
              }
              <div class="ws-chips">@for (t of note.tags; track t) { <span class="ws-chip">#{{ t }}</span> }</div>
              <div class="ws-spread">
                <small class="ws-muted">Updated {{ note.updatedAt | date: 'MMM d' }}</small>
                <span class="ws-row-flex"><button type="button" class="button button--sm" (click)="editingId.set(note.id)">Edit</button><button type="button" class="button button--sm button--danger" (click)="remove(note)">Delete</button></span>
              </div>
            </article>
          } @empty {
            <app-empty-state heading="No notes found" message="Open a lesson and use the Notes tab to capture ideas." actionLabel="Go to My Learning" actionLink="/student/my-courses"></app-empty-state>
          }
        </div>
      }
    </div>
  `,
})
export class NotesComponent implements OnInit {
  protected readonly notes = signal<readonly LearnerNote[]>([]);
  protected readonly loading = signal(true);
  protected readonly query = signal('');
  protected readonly tag = signal('');
  protected readonly editingId = signal<string | null>(null);
  protected readonly undo = signal<LearnerNote | null>(null);
  protected readonly tags = computed(() => [...new Set(this.notes().flatMap((note) => note.tags))].sort());
  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.notes().filter((note) => (!this.tag() || note.tags.includes(this.tag())) && (!query || `${note.body} ${note.lessonTitle} ${note.courseTitle}`.toLowerCase().includes(query)));
  });
  private readonly gateway = inject(LearningActivityGateway);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private undoTimer?: number;

  ngOnInit(): void {
    this.gateway.listNotes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((notes) => {
      this.notes.set(notes);
      this.loading.set(false);
    });
    this.destroyRef.onDestroy(() => window.clearTimeout(this.undoTimer));
  }

  protected save(note: LearnerNote, body: string): void {
    this.gateway.saveNote({ ...note, body }).subscribe((saved) => {
      this.notes.update((notes) => notes.map((item) => (item.id === saved.id ? saved : item)));
      this.editingId.set(null);
    });
  }

  protected remove(note: LearnerNote): void {
    this.gateway.deleteNote(note.id).subscribe(() => {
      this.notes.update((notes) => notes.filter((item) => item.id !== note.id));
      this.undo.set(note);
      window.clearTimeout(this.undoTimer);
      this.undoTimer = window.setTimeout(() => this.undo.set(null), 8000);
    });
  }

  protected restore(note: LearnerNote): void {
    this.gateway.saveNote(note).subscribe((saved) => {
      this.notes.update((notes) => [saved, ...notes]);
      this.undo.set(null);
    });
  }

  protected export(): void {
    const markdown = this.notes().map((note) => `## ${note.courseTitle} — ${note.lessonTitle}${note.timestamp ? ` (${note.timestamp})` : ''}\n\n${note.body}\n`).join('\n');
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'learnova-notes.md';
    link.click();
    URL.revokeObjectURL(url);
    this.notifications.show('Notes exported', { tone: 'success' });
  }
}
