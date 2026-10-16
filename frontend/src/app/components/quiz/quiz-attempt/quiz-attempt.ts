import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, concatMap, finalize, from, switchMap, tap, timer, toArray } from 'rxjs';
import { NotificationService } from '../../../core/notifications/notification.service';
import { DraftStorageService } from '../../../core/storage/draft-storage.service';
import { Answer, AnswerResult } from '../../../models/answer.model';
import { Question } from '../../../models/question.model';
import { QuizScore } from '../../../models/quiz-score.model';
import { StartQuizResponse } from '../../../models/quiz.model';
import { AnswerService } from '../../../services/answer.service';
import { AuthService } from '../../../services/auth-service';
import { QuestionService } from '../../../services/question.service';
import { QuizResultsService } from '../../../services/quiz-results.service';
import { QuizScoreService } from '../../../services/quiz-score.service';
import { QuizService } from '../../../services/quiz.service';

interface AttemptDraft {
  version: 1;
  courseId: number;
  quizId: number;
  quizData: StartQuizResponse;
  deadlineMs: number | null;
  responses: Record<number, string>;
  answerResults: AnswerResult[];
  flaggedQuestionIds: number[];
  currentQuestionIndex: number;
}

@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-attempt.html',
  styleUrls: ['./quiz-attempt.scss', './quiz-attempt-review.scss'],
})
export class QuizAttemptComponent implements OnInit, OnDestroy {
  protected readonly quizData = signal<StartQuizResponse | null>(null);
  protected readonly questions = signal<readonly Question[]>([]);
  protected readonly currentQuestionIndex = signal(0);
  protected readonly responses = signal<Record<number, string>>({});
  protected readonly answerResults = signal<readonly AnswerResult[]>([]);
  protected readonly flaggedQuestionIds = signal<ReadonlySet<number>>(new Set());
  protected readonly mode = signal<'attempt' | 'review'>('attempt');
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly timeRemaining = signal<number | null>(null);
  protected readonly autosaveStatus = signal<'saved' | 'saving' | 'failed'>('saved');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  protected readonly answeredCount = computed(() => Object.values(this.responses()).filter(Boolean).length);
  protected readonly unansweredCount = computed(() => Math.max(0, this.questions().length - this.answeredCount()));
  protected readonly progress = computed(() => this.questions().length ? Math.round(((this.currentQuestionIndex() + 1) / this.questions().length) * 100) : 0);
  protected readonly timerDisplay = computed(() => {
    const remaining = this.timeRemaining();
    if (remaining === null) return 'No time limit';
    const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
    const seconds = (remaining % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  });
  protected courseId = 0;
  protected quizId = 0;
  private deadlineMs: number | null = null;
  private timerSubscription?: Subscription;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quizService = inject(QuizService);
  private readonly questionService = inject(QuestionService);
  private readonly answerService = inject(AnswerService);
  private readonly quizScoreService = inject(QuizScoreService);
  private readonly resultsService = inject(QuizResultsService);
  private readonly authService = inject(AuthService);
  private readonly drafts = inject(DraftStorageService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    if (!Number.isInteger(this.courseId) || !Number.isInteger(this.quizId)) {
      this.errorMessage.set('This assessment address is not valid.');
      this.loading.set(false);
      return;
    }

    const restored = this.restoreDraft();
    if (restored) {
      this.applyDraft(restored);
      this.loadQuestions();
      this.startTimer();
    } else {
      this.startAttempt();
    }
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  protected selectedResponse(): string {
    const question = this.currentQuestion();
    return question ? this.responses()[question.questionID] ?? '' : '';
  }

  protected selectResponse(response: string): void {
    const question = this.currentQuestion();
    if (!question) return;
    this.autosaveStatus.set('saving');
    this.responses.update((responses) => ({ ...responses, [question.questionID]: response }));
    this.persistDraft();
    this.autosaveStatus.set('saved');
  }

  protected navigateToQuestion(index: number): void {
    if (index < 0 || index >= this.questions().length) return;
    this.currentQuestionIndex.set(index);
    this.mode.set('attempt');
    this.persistDraft();
  }

  protected previousQuestion(): void {
    this.navigateToQuestion(this.currentQuestionIndex() - 1);
  }

  protected nextQuestion(): void {
    if (this.currentQuestionIndex() >= this.questions().length - 1) this.mode.set('review');
    else this.navigateToQuestion(this.currentQuestionIndex() + 1);
  }

  protected toggleFlag(): void {
    const question = this.currentQuestion();
    if (!question) return;
    this.flaggedQuestionIds.update((flags) => {
      const next = new Set(flags);
      if (next.has(question.questionID)) next.delete(question.questionID);
      else next.add(question.questionID);
      return next;
    });
    this.persistDraft();
  }

  protected isFlagged(questionId: number): boolean {
    return this.flaggedQuestionIds().has(questionId);
  }

  protected isAnswered(questionId: number): boolean {
    return !!this.responses()[questionId];
  }

  protected openReview(): void {
    this.mode.set('review');
  }

  protected saveAndExit(): void {
    this.persistDraft();
    this.notifications.show('Attempt saved for this browser session', { tone: 'success' });
    void this.router.navigate(['/course', this.courseId, 'quiz', 'list']);
  }

  protected submitAttempt(): void {
    const quizData = this.quizData();
    const userId = this.authService.getCurrentUserId();
    if (!quizData || this.submitting()) return;
    if (!userId) {
      this.errorMessage.set('Your session ended. Sign in again before submitting.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.timerSubscription?.unsubscribe();
    const existingResults = [...this.answerResults()];
    const acknowledgedIds = new Set(existingResults.map((result) => result.questionID));
    const pendingQuestions = this.questions().filter(
      (question) => this.responses()[question.questionID] && !acknowledgedIds.has(question.questionID),
    );

    from(pendingQuestions)
      .pipe(
        concatMap((question) => {
          const answer: Answer = {
            questionID: question.questionID,
            response: this.responses()[question.questionID],
            quizID: this.quizId,
            attemptNumber: quizData.currentAttemptNumber,
          };
          return this.answerService.submitAnswer(answer).pipe(
            tap((result) => {
              const answerResult: AnswerResult = {
                questionID: result.questionID,
                questionText: question.questionText,
                response: result.response,
                quizID: result.quizID,
                attemptNumber: result.attemptNumber,
                isCorrect: result.isCorrect ?? false,
                marksAwarded: result.marksAwarded ?? 0,
                totalMarks: question.marks,
              };
              this.answerResults.update((results) => [...results.filter((item) => item.questionID !== answerResult.questionID), answerResult]);
              this.persistDraft();
            }),
          );
        }),
        toArray(),
        switchMap(() => {
          const score: QuizScore = { quizID: this.quizId, userID: userId, attemptNumber: quizData.currentAttemptNumber };
          return this.quizScoreService.submitQuizScore(score);
        }),
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (score) => {
          this.resultsService.setResults({
            score: score.score,
            totalMarks: quizData.totalMarks ?? 0,
            answers: [...this.answerResults()],
            attemptNumber: score.attemptNumber || quizData.currentAttemptNumber,
            quizTitle: quizData.title,
            courseId: this.courseId,
            quizId: this.quizId,
            submittedAt: new Date().toISOString(),
          });
          this.drafts.write(this.attemptKey(), '');
          void this.router.navigate(['/course', this.courseId, 'quiz', 'results'], { queryParams: { quizId: this.quizId } });
        },
        error: () => {
          this.errorMessage.set('Submission was interrupted. Acknowledged answers are saved; retry when connected.');
          this.startTimer();
        },
      });
  }

  private startAttempt(): void {
    this.loading.set(true);
    this.quizService
      .startQuiz(this.quizId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.quizData.set(data);
          this.deadlineMs = data.timeLimit && data.timeLimit > 0 ? Date.now() + data.timeLimit * 60_000 : null;
          this.persistDraft();
          this.loadQuestions();
          this.startTimer();
        },
        error: () => {
          this.errorMessage.set('The assessment could not be started. No attempt data was changed locally.');
          this.loading.set(false);
        },
      });
  }

  private loadQuestions(): void {
    this.questionService
      .getQuestionsByQuiz(this.quizId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (questions) => {
          this.questions.set(questions ?? []);
          this.currentQuestionIndex.set(Math.min(this.currentQuestionIndex(), Math.max(0, questions.length - 1)));
          this.loading.set(false);
          if (!questions.length) this.errorMessage.set('No questions have been published for this assessment.');
          if (this.timeRemaining() === 0) this.submitAttempt();
        },
        error: () => {
          this.errorMessage.set('Questions could not be loaded. Your saved attempt remains available.');
          this.loading.set(false);
        },
      });
  }

  private startTimer(): void {
    this.timerSubscription?.unsubscribe();
    if (this.deadlineMs === null) {
      this.timeRemaining.set(null);
      return;
    }
    this.timerSubscription = timer(0, 1000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const remaining = Math.max(0, Math.ceil((this.deadlineMs! - Date.now()) / 1000));
      this.timeRemaining.set(remaining);
      if (remaining === 0) {
        this.timerSubscription?.unsubscribe();
        this.notifications.show('Time is complete', { detail: 'Submitting the answers saved in this attempt.', tone: 'warning' });
        if (this.questions().length) this.submitAttempt();
      }
    });
  }

  private persistDraft(): void {
    const quizData = this.quizData();
    if (!quizData || !this.courseId || !this.quizId) return;
    const draft: AttemptDraft = { version: 1, courseId: this.courseId, quizId: this.quizId, quizData, deadlineMs: this.deadlineMs, responses: this.responses(), answerResults: [...this.answerResults()], flaggedQuestionIds: [...this.flaggedQuestionIds()], currentQuestionIndex: this.currentQuestionIndex() };
    try {
      this.drafts.write(this.attemptKey(), JSON.stringify(draft));
    } catch {
      this.autosaveStatus.set('failed');
    }
  }

  private restoreDraft(): AttemptDraft | null {
    const value = this.drafts.read(this.attemptKey());
    if (!value) return null;
    try {
      const draft = JSON.parse(value) as Partial<AttemptDraft>;
      return draft.version === 1 && draft.courseId === this.courseId && draft.quizId === this.quizId && !!draft.quizData && typeof draft.responses === 'object' && Array.isArray(draft.answerResults) && Array.isArray(draft.flaggedQuestionIds) ? (draft as AttemptDraft) : null;
    } catch {
      return null;
    }
  }

  private applyDraft(draft: AttemptDraft): void {
    this.quizData.set(draft.quizData);
    this.deadlineMs = draft.deadlineMs;
    this.responses.set(draft.responses);
    this.answerResults.set(draft.answerResults);
    this.flaggedQuestionIds.set(new Set(draft.flaggedQuestionIds));
    this.currentQuestionIndex.set(draft.currentQuestionIndex);
  }

  private attemptKey(): string {
    return `quiz_${this.courseId}_${this.quizId}_attempt`;
  }
}
