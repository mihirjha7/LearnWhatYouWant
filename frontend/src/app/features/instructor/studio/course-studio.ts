import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, debounceTime, finalize, switchMap } from 'rxjs';
import { NotificationService } from '../../../core/notifications/notification.service';
import {
  InstructorGateway,
  ReadinessCheck,
  StudioCourse,
  StudioLesson,
  StudioSection,
} from '../../../data-access/contracts/instructor.contracts';
import { EmptyStateComponent, SkeletonComponent, StatusBadgeComponent } from '../../../shared/ui/primitives';
import { LIFECYCLE } from '../lifecycle';
import { moveItem } from './studio-utils';

type StudioTab = 'setup' | 'curriculum' | 'accessibility' | 'publish';

@Component({
  selector: 'app-course-studio',
  standalone: true,
  imports: [DatePipe, RouterLink, ReactiveFormsModule, SkeletonComponent, EmptyStateComponent, StatusBadgeComponent],
  templateUrl: './course-studio.html',
})
export class CourseStudioComponent implements OnInit {
  protected readonly course = signal<StudioCourse | null>(null);
  protected readonly loading = signal(true);
  protected readonly tab = signal<StudioTab>('setup');
  protected readonly saveState = signal<'saved' | 'saving' | 'unsaved' | 'conflict' | 'error'>('saved');
  protected readonly readiness = signal<readonly ReadinessCheck[]>([]);
  protected readonly selectedLessonId = signal<string | null>(null);
  protected readonly removed = signal<{ sectionId: string; lesson: StudioLesson; index: number } | null>(null);
  protected readonly publishing = signal(false);
  protected readonly lifecycle = LIFECYCLE;
  protected readonly tabs: readonly { id: StudioTab; label: string }[] = [
    { id: 'setup', label: 'Setup' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'accessibility', label: 'Accessibility' },
    { id: 'publish', label: 'Publish' },
  ];
  protected readonly lessonTypes: readonly StudioLesson['type'][] = ['video', 'reading', 'quiz', 'lab', 'assignment'];
  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(8)]],
    subtitle: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(80)]],
    category: [''],
    level: ['Beginner' as StudioCourse['level']],
    language: ['English'],
    access: ['free' as StudioCourse['access']],
    outcomes: [''],
    requirements: [''],
  });
  protected readonly selectedLesson = computed(() => {
    const id = this.selectedLessonId();
    return this.course()?.sections.flatMap((section) => section.lessons).find((lesson) => lesson.id === id) ?? null;
  });
  protected readonly allPassed = computed(() => this.readiness().length > 0 && this.readiness().every((check) => check.passed));
  protected readonly videoLessons = computed(() => this.course()?.sections.flatMap((section) => section.lessons.filter((lesson) => lesson.type === 'video')) ?? []);
  protected scheduleAt = '';

  private readonly gateway = inject(InstructorGateway);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changes = new Subject<void>();
  private undoTimer?: number;

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab') as StudioTab | null;
    if (tab && this.tabs.some((item) => item.id === tab)) this.tab.set(tab);
    this.load();

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const value = this.form.getRawValue();
      this.course.update((course) => course ? {
        ...course,
        ...value,
        outcomes: value.outcomes.split('\n').map((line) => line.trim()).filter(Boolean),
        requirements: value.requirements.split('\n').map((line) => line.trim()).filter(Boolean),
      } : course);
      this.markChanged();
    });

    this.changes
      .pipe(
        debounceTime(1500),
        switchMap(() => {
          const course = this.course();
          if (!course || this.saveState() === 'conflict') return EMPTY;
          this.saveState.set('saving');
          return this.gateway.saveStudioCourse(course).pipe(
            catchError((error: { status?: number }) => {
              this.saveState.set(error.status === 409 ? 'conflict' : 'error');
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((saved) => {
        this.course.update((course) => course ? { ...course, version: saved.version, updatedAt: saved.updatedAt } : course);
        this.saveState.set('saved');
        this.refreshReadiness();
      });

    this.destroyRef.onDestroy(() => window.clearTimeout(this.undoTimer));
  }

  protected selectTab(tab: StudioTab): void {
    this.tab.set(tab);
    void this.router.navigate([], { relativeTo: this.route, queryParams: { tab }, replaceUrl: true });
    if (tab === 'publish' || tab === 'accessibility') this.refreshReadiness();
  }

  protected reloadLatest(): void {
    this.saveState.set('saved');
    this.load();
  }

  protected addSection(): void {
    this.mutateSections((sections) => [...sections, { id: `sec-${Date.now().toString(36)}`, title: `Section ${sections.length + 1}`, lessons: [] }]);
  }

  protected renameSection(sectionId: string, title: string): void {
    this.mutateSections((sections) => sections.map((section) => section.id === sectionId ? { ...section, title } : section));
  }

  protected moveSection(index: number, offset: -1 | 1): void {
    this.mutateSections((sections) => moveItem(sections, index, index + offset));
  }

  protected removeSection(sectionId: string): void {
    this.mutateSections((sections) => sections.filter((section) => section.id !== sectionId || section.lessons.length > 0));
  }

  protected addLesson(sectionId: string, type: StudioLesson['type']): void {
    const lesson: StudioLesson = { id: `les-${Date.now().toString(36)}`, title: `New ${type}`, type, durationMinutes: 10, media: type === 'video' ? 'uploaded' : 'none', hasCaptions: type !== 'video', freePreview: false };
    this.mutateSections((sections) => sections.map((section) => section.id === sectionId ? { ...section, lessons: [...section.lessons, lesson] } : section));
    this.selectedLessonId.set(lesson.id);
  }

  protected duplicateLesson(sectionId: string, lesson: StudioLesson): void {
    const copy = { ...lesson, id: `les-${Date.now().toString(36)}`, title: `${lesson.title} (copy)` };
    this.mutateSections((sections) => sections.map((section) => {
      if (section.id !== sectionId) return section;
      const index = section.lessons.findIndex((item) => item.id === lesson.id);
      const lessons = [...section.lessons];
      lessons.splice(index + 1, 0, copy);
      return { ...section, lessons };
    }));
  }

  protected moveLesson(sectionId: string, index: number, offset: -1 | 1): void {
    this.mutateSections((sections) => sections.map((section) => section.id === sectionId ? { ...section, lessons: moveItem(section.lessons, index, index + offset) } : section));
  }

  protected moveLessonToSection(fromSectionId: string, lesson: StudioLesson, toSectionId: string): void {
    if (fromSectionId === toSectionId) return;
    this.mutateSections((sections) => sections.map((section) => {
      if (section.id === fromSectionId) return { ...section, lessons: section.lessons.filter((item) => item.id !== lesson.id) };
      if (section.id === toSectionId) return { ...section, lessons: [...section.lessons, lesson] };
      return section;
    }));
    this.notifications.show(`Moved “${lesson.title}”`, { tone: 'info', durationMs: 3000 });
  }

  protected deleteLesson(sectionId: string, lesson: StudioLesson): void {
    const index = this.course()?.sections.find((section) => section.id === sectionId)?.lessons.findIndex((item) => item.id === lesson.id) ?? 0;
    this.mutateSections((sections) => sections.map((section) => section.id === sectionId ? { ...section, lessons: section.lessons.filter((item) => item.id !== lesson.id) } : section));
    if (this.selectedLessonId() === lesson.id) this.selectedLessonId.set(null);
    this.removed.set({ sectionId, lesson, index });
    window.clearTimeout(this.undoTimer);
    this.undoTimer = window.setTimeout(() => this.removed.set(null), 8000);
  }

  protected undoDelete(): void {
    const removed = this.removed();
    if (!removed) return;
    this.mutateSections((sections) => sections.map((section) => {
      if (section.id !== removed.sectionId) return section;
      const lessons = [...section.lessons];
      lessons.splice(removed.index, 0, removed.lesson);
      return { ...section, lessons };
    }));
    this.removed.set(null);
  }

  protected updateLesson(change: Partial<StudioLesson>): void {
    const id = this.selectedLessonId();
    if (!id) return;
    this.mutateSections((sections) => sections.map((section) => ({ ...section, lessons: section.lessons.map((lesson) => lesson.id === id ? { ...lesson, ...change } : lesson) })));
  }

  protected retryMedia(): void {
    this.updateLesson({ media: 'transcoding' });
    this.notifications.show('Processing restarted', { detail: 'You can keep editing while media processes.', tone: 'info' });
  }

  protected sectionOf(lessonId: string): StudioSection | undefined {
    return this.course()?.sections.find((section) => section.lessons.some((lesson) => lesson.id === lessonId));
  }

  protected publish(mode: 'now' | 'schedule' | 'review'): void {
    const course = this.course();
    if (!course || this.publishing()) return;
    if (mode === 'schedule' && !this.scheduleAt) {
      this.notifications.show('Choose a date and time to schedule', { tone: 'warning' });
      return;
    }
    this.publishing.set(true);
    this.gateway.publish(course.id, mode, mode === 'schedule' ? new Date(this.scheduleAt).toISOString() : undefined).pipe(finalize(() => this.publishing.set(false))).subscribe((updated) => {
      this.course.set(updated);
      const message = { now: 'Course published', schedule: 'Publishing scheduled', review: 'Submitted for review' }[mode];
      this.notifications.show(message, { tone: 'success' });
    });
  }

  private load(): void {
    const id = this.route.snapshot.paramMap.get('courseId') ?? '';
    this.loading.set(true);
    this.gateway.getStudioCourse(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (course) => {
        this.course.set(course);
        this.form.reset({ ...course, outcomes: course.outcomes.join('\n'), requirements: course.requirements.join('\n') }, { emitEvent: false });
        this.selectedLessonId.set(course.sections[0]?.lessons[0]?.id ?? null);
        this.loading.set(false);
        this.refreshReadiness();
      },
      error: () => this.loading.set(false),
    });
  }

  private mutateSections(change: (sections: readonly StudioSection[]) => readonly StudioSection[]): void {
    this.course.update((course) => course ? { ...course, sections: change(course.sections) } : course);
    this.markChanged();
  }

  private markChanged(): void {
    if (this.saveState() !== 'conflict') this.saveState.set('unsaved');
    this.changes.next();
  }

  private refreshReadiness(): void {
    const course = this.course();
    if (course) this.gateway.getReadiness(course).subscribe((checks) => this.readiness.set(checks));
  }
}
