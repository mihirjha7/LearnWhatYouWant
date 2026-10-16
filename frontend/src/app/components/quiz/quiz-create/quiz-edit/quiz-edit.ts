import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QuizService } from '../../../../services/quiz.service';
import { Quiz } from '../../../../models/quiz.model';


@Component({
  selector: 'app-quiz-edit-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="app-card-title">Edit Quiz</h2>
    <div mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Course ID</mat-label>
          <input matInput type="number" formControlName="courseID" />
          <mat-error *ngIf="form.get('courseID')?.hasError('required')">Required</mat-error>
          <mat-error *ngIf="form.get('courseID')?.hasError('min')">Must be ≥ 1</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" maxlength="150"/>
          <mat-hint align="end">{{ form.get('title')?.value?.length || 0 }}/150</mat-hint>
          <mat-error *ngIf="form.get('title')?.hasError('required')">Required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Total Marks</mat-label>
          <input matInput type="number" formControlName="totalMarks"/>
          <mat-error *ngIf="form.get('totalMarks')?.hasError('required')">Required</mat-error>
          <mat-error *ngIf="form.get('totalMarks')?.hasError('min')">Must be ≥ 1</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Time Limit (minutes)</mat-label>
          <input matInput type="number" formControlName="timeLimit"/>
          <mat-error *ngIf="form.get('timeLimit')?.hasError('required')">Required</mat-error>
          <mat-error *ngIf="form.get('timeLimit')?.hasError('min')">Must be ≥ 1</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Attempts Allowed</mat-label>
          <input matInput type="number" formControlName="attemptsAllowed"/>
          <mat-error *ngIf="form.get('attemptsAllowed')?.hasError('required')">Required</mat-error>
          <mat-error *ngIf="form.get('attemptsAllowed')?.hasError('min')">Must be ≥ 1</mat-error>
        </mat-form-field>
      </form>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid || saving">
        <mat-icon>save</mat-icon> Save
      </button>
    </div>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  `]
})
export class QuizEditDialogComponent {
  private fb = inject(FormBuilder);
  private svc = inject(QuizService);
  private ref = inject(MatDialogRef<QuizEditDialogComponent>);

  saving = false;

  form = this.fb.group({
    courseID: [0, [Validators.required, Validators.min(1)]],
    title: ['', [Validators.required, Validators.maxLength(150)]],
    totalMarks: [1, [Validators.required, Validators.min(1)]],
    timeLimit: [30, [Validators.required, Validators.min(1)]],
    attemptsAllowed: [1, [Validators.required, Validators.min(1)]]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { quiz: Quiz }) {
    const { quiz } = data;
    this.form.patchValue({
      courseID: quiz.courseID,
      title: quiz.title,
      totalMarks: quiz.totalMarks,
      timeLimit: quiz.timeLimit,
      attemptsAllowed: quiz.attemptsAllowed
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.svc.updateQuiz(this.data.quiz.quizID, this.form.getRawValue()).subscribe({
      next: (updated) => {
        this.saving = false;
        this.ref.close(updated);
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}