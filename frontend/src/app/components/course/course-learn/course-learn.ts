import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { MediaUrlService } from '../../../core/media/media-url.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { DraftStorageService } from '../../../core/storage/draft-storage.service';
import { LearningActivityGateway } from '../../../data-access/contracts/learning-activity.contracts';
import { Course, Lesson } from '../../../models/course.model';
import { CourseService } from '../../../services/course-service';

type PlayerPanel = 'overview' | 'transcript' | 'notes' | 'resources';

@Component({
  selector: 'app-course-learn',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './course-learn.html',
  styleUrl: './course-learn.css',
})
export class CourseLearn {
  protected readonly course = signal<Course | null>(null);
  protected readonly currentLesson = signal<Lesson | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly sidebarOpen = signal(false);
  protected readonly activePanel = signal<PlayerPanel>('overview');
  protected readonly completedLessonIds = signal<ReadonlySet<number>>(new Set());
  protected readonly note = new FormControl('', { nonNullable: true });
  protected readonly currentYoutubeUrl = computed(() => this.media.youtubeEmbedUrl(this.currentLesson()?.videoURL));
  protected readonly currentNativeVideoUrl = computed(() => this.currentYoutubeUrl() ? null : this.media.safeNativeMediaUrl(this.currentLesson()?.videoURL));
  protected readonly progress = computed(() => {
    const total = this.course()?.lessons.length ?? 0;
    return total ? Math.round((this.completedLessonIds().size / total) * 100) : 0;
  });
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly courseService = inject(CourseService);
  private readonly media = inject(MediaUrlService);
  private readonly drafts = inject(DraftStorageService);
  private readonly notifications = inject(NotificationService);
  private readonly activity = inject(LearningActivityGateway);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((parameters) => {
          const id = Number(parameters.get('id'));
          if (!Number.isInteger(id) || id <= 0) {
            this.errorMessage.set('This course address is not valid.');
            return of(null);
          }
          return this.courseService.getCourse(id);
        }),
        catchError(() => {
          this.errorMessage.set('The course could not be loaded. Your saved notes remain on this device.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((course) => {
        this.course.set(course);
        const lessonId = Number(this.route.snapshot.queryParamMap.get('lessonId'));
        const lesson = course?.lessons.find((item) => item.lessonID === lessonId) ?? course?.lessons[0] ?? null;
        this.setLesson(lesson, false);
        this.isLoading.set(false);
      });
  }

  protected selectLesson(lesson: Lesson): void {
    this.setLesson(lesson, true);
    this.sidebarOpen.set(false);
  }

  protected previousLesson(): void {
    const index = this.lessonIndex();
    const lessons = this.course()?.lessons;
    if (lessons && index > 0) this.selectLesson(lessons[index - 1]);
  }

  protected nextLesson(): void {
    const index = this.lessonIndex();
    const lessons = this.course()?.lessons;
    if (lessons && index >= 0 && index < lessons.length - 1) this.selectLesson(lessons[index + 1]);
  }

  protected hasPrevious(): boolean {
    return this.lessonIndex() > 0;
  }

  protected hasNext(): boolean {
    const lessons = this.course()?.lessons;
    const index = this.lessonIndex();
    return !!lessons && index >= 0 && index < lessons.length - 1;
  }

  protected markComplete(): void {
    const lesson = this.currentLesson();
    if (!lesson) return;
    this.completedLessonIds.update((completed) => new Set([...completed, lesson.lessonID]));
    this.notifications.show('Lesson marked complete', { detail: `${this.progress()}% of this course complete.`, tone: 'success' });
    if (this.hasNext()) this.nextLesson();
  }

  protected isComplete(lessonId: number): boolean {
    return this.completedLessonIds().has(lessonId);
  }

  protected saveNote(): void {
    const key = this.noteKey();
    if (!key) return;
    this.drafts.write(key, this.note.value);
    const course = this.course();
    const lesson = this.currentLesson();
    if (course && lesson && this.note.value.trim()) {
      this.activity
        .saveNote({ id: key, courseTitle: course.title, lessonTitle: lesson.title, body: this.note.value.trim(), tags: [] })
        .subscribe();
    }
    this.notifications.show('Private note saved', { detail: 'Find it any time in Notes.', tone: 'success' });
  }

  protected goToQuizzes(): void {
    const id = this.course()?.courseID;
    if (id) void this.router.navigate(['/course', id, 'quiz', 'list']);
  }

  protected exitCourse(): void {
    const id = this.course()?.courseID;
    void this.router.navigate(id ? ['/course', id] : ['/student/my-courses']);
  }

  private setLesson(lesson: Lesson | null, updateUrl: boolean): void {
    this.currentLesson.set(lesson);
    this.activePanel.set('overview');
    const noteKey = lesson ? this.noteKey(lesson) : null;
    this.note.setValue(noteKey ? this.drafts.read(noteKey) : '', { emitEvent: false });
    if (lesson && updateUrl) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { lessonId: lesson.lessonID },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  private lessonIndex(): number {
    const lesson = this.currentLesson();
    return lesson ? this.course()?.lessons.findIndex((item) => item.lessonID === lesson.lessonID) ?? -1 : -1;
  }

  private noteKey(lesson = this.currentLesson()): string | null {
    const courseId = this.course()?.courseID;
    return courseId && lesson ? `course_${courseId}_lesson_${lesson.lessonID}_note` : null;
  }
}
