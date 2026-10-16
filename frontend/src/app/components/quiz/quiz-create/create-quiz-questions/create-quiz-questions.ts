import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { QuizService } from '../../../../services/quiz.service';
import { CreateQuestionRequest, QuestionType } from '../../../../models/question.model';
import { CreateQuizRequest } from '../../../../models/quiz.model';
import { ActivatedRoute } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-create-quiz-questions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatStepperModule,
    MatDividerModule,
    MatListModule,
    MatProgressBarModule,
  ],
  templateUrl: './create-quiz-questions.html',
  styleUrls: [`./create-quiz-questions.scss`],
})
export class CreateQuizQuestionsComponent {
  private fb = inject(FormBuilder);
  private svc = inject(QuizService);
  private snack = inject(MatSnackBar);

  private route = inject(ActivatedRoute);
  courseId = this.route.snapshot.paramMap.get('courseId');

  loading = signal(false);
  quizId = signal<number | null>(null);
  createdQuestions = signal<CreateQuestionRequest[]>([]);

  quizForm = this.fb.group({
    courseID: [null as number | null, [Validators.required, Validators.min(1)]],
    title: ['', [Validators.required, Validators.maxLength(150)]],
    totalMarks: [1, [Validators.required, Validators.min(1)]],
    timeLimit: [30, [Validators.required, Validators.min(1)]],
    attemptsAllowed: [1, [Validators.required, Validators.min(1)]],
  });

  questionForm = this.fb.group({
    questionText: ['', [Validators.required, Validators.minLength(5)]],
    questionType: ['MCQ' as QuestionType, [Validators.required]],
    options: this.fb.array<string>([]),
    correctAnswer: ['', [Validators.required]],
    marks: [1, [Validators.required, Validators.min(1)]],
  });

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  /** === Quiz === */
  submitQuiz() {
    if (this.quizForm.invalid) return;
    this.loading.set(true);

    const payload: CreateQuizRequest = this.quizForm.getRawValue() as CreateQuizRequest;

    this.svc.createQuiz(payload).subscribe({
      next: (id) => {
        this.quizId.set(id);
        this.loading.set(false);
        this.snack.open(`Quiz created (ID: ${id})`, 'OK', { duration: 2500 });
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
        this.snack.open(`Failed to create quiz: ${err?.message ?? 'Unknown error'}`, 'Dismiss', {
          duration: 3500,
        });
      },
    });
  }

  /** === Questions === */
  onTypeChange() {
    const type = this.questionForm.get('questionType')?.value as QuestionType;
    // Reset options appropriately
    this.options.clear();

    if (type === 'MCQ') {
      this.options.push(this.fb.control(''));
      this.options.push(this.fb.control(''));
      this.questionForm.get('correctAnswer')?.setValue('');
    } else if (type === 'TRUE_FALSE') {
      this.options.push(this.fb.control('True'));
      this.options.push(this.fb.control('False'));
      this.questionForm.get('correctAnswer')?.setValue('');
    } else {
      // SHORT_ANSWER
      this.questionForm.get('correctAnswer')?.setValue('');
    }
  }

  showOptions() {
    const type = this.questionForm.get('questionType')?.value as QuestionType;
    return type === 'MCQ' || type === 'TRUE_FALSE';
  }

  showCorrectAnswer() {
    const type = this.questionForm.get('questionType')?.value as QuestionType;
    return type === 'MCQ' || type === 'TRUE_FALSE' || type === 'SHORT_ANSWER';
  }

  minOptionsRequired(): number {
    const type = this.questionForm.get('questionType')?.value as QuestionType;
    return type === 'MCQ' ? 2 : 2; // TRUE_FALSE must keep 2, MCQ min 2
  }

  canAddOption(): boolean {
    const type = this.questionForm.get('questionType')?.value as QuestionType;
    return type === 'MCQ'; // Only MCQ supports adding more options
  }

  addOption() {
    if (this.canAddOption()) {
      this.options.push(this.fb.control(''));
    }
  }

  removeOption(i: number) {
    if (this.options.length > this.minOptionsRequired()) {
      this.options.removeAt(i);
    }
  }

  submitQuestion() {
    if (!this.quizId()) {
      this.snack.open('Create the quiz first.', 'OK', { duration: 2500 });
      return;
    }
    if (this.questionForm.invalid) {
      this.snack.open('Please fix validation errors in the question form.', 'OK', {
        duration: 2500,
      });
      return;
    }

    const type = this.questionForm.get('questionType')?.value as QuestionType;
    const payload = this.questionForm.getRawValue() as CreateQuestionRequest;

    // Additional client-side checks
    if (type === 'MCQ') {
      const opts = payload.options.map((o) => (o ?? '').trim()).filter((o) => o.length > 0);
      if (opts.length < 2) {
        this.snack.open('MCQ requires at least 2 non-empty options.', 'OK', { duration: 3000 });
        return;
      }
      if (!opts.includes((payload.correctAnswer ?? '').trim())) {
        this.snack.open('Correct answer must exactly match one of the MCQ options.', 'OK', {
          duration: 3000,
        });
        return;
      }
    } else if (type === 'TRUE_FALSE') {
      const ca = (payload.correctAnswer ?? '').trim();
      if (!['True', 'False'].includes(ca)) {
        this.snack.open('Correct answer must be either "True" or "False".', 'OK', {
          duration: 3000,
        });
        return;
      }
    }

    this.loading.set(true);
    this.svc.createQuestion(this.quizId()!, payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.createdQuestions.update((curr) => [...curr, payload]);
        this.snack.open('Question added.', 'OK', { duration: 2000 });
        // Reset for next question, keeping type and marks
        const keepType = this.questionForm.get('questionType')?.value;
        const keepMarks = this.questionForm.get('marks')?.value;
        this.questionForm.reset({
          questionText: '',
          questionType: keepType,
          options: [],
          correctAnswer: '',
          marks: keepMarks,
        });
        this.onTypeChange();
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
        this.snack.open(`Failed to add question: ${err?.message ?? 'Unknown error'}`, 'Dismiss', {
          duration: 3500,
        });
      },
    });
  }

  resetQuestionForm() {
    this.questionForm.reset({
      questionText: '',
      questionType: 'MCQ',
      options: [],
      correctAnswer: '',
      marks: 1,
    });
    this.onTypeChange();
  }

  finish(stepper: any) {
    this.snack.open(
      `Quiz ${this.quizId()} saved with ${this.createdQuestions().length} question(s).`,
      'Great!',
      { duration: 3500 }
    );
    stepper.reset();
    this.quizForm.reset();
    this.questionForm.reset();
    this.quizId.set(null);
    this.createdQuestions.set([]);
  }

  // Initialize defaults
  constructor() {
    this.onTypeChange(); // prepare initial options for MCQ

    // If navigated with ?quizId=123, set it and skip to step 2
    this.route.queryParamMap.subscribe((params) => {
      const qid = Number(params.get('quizId'));
      if (qid && !Number.isNaN(qid)) {
        this.quizId.set(qid);
        // The template has a reference #stepper. If you want to auto-select step 2,
        // you can also ViewChild(MatStepper) and set selectedIndex = 1 in ngAfterViewInit().
        // Or simply instruct the user to click "Questions" step; we show the "Quiz created with ID".
      }
    });
  }
}
