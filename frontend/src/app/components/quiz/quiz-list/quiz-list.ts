import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QuizService } from '../../../services/quiz.service';
import { Quiz } from '../../../models/quiz.model';
import { QuizCardComponent } from '../quiz-card/quiz-card';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    QuizCardComponent
  ],
  templateUrl: './quiz-list.html',
  styleUrls: ['./quiz-list.scss']
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];
  courseId!: number;
  loading = true;
  courseName = 'Course Quizzes'; // Will be fetched from API

  constructor(
    private quizService: QuizService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Get courseId from route params
    this.route.params.subscribe(params => {
      this.courseId = +params['courseId'];
      if (this.courseId) {
        this.loadQuizzes();
      } else {
        this.snackBar.open('Invalid course ID', 'Close', { duration: 3000 });
        this.router.navigate(['/home']);
      }
    });
  }

  loadQuizzes() {
    this.loading = true;
    this.quizService.getQuizzesByCourse(this.courseId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
        this.snackBar.open('Error loading quizzes', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onStartQuiz(quizId: number) {
    this.router.navigate(['/course', this.courseId, 'quiz', quizId, 'attempt']);
  }

  goBack() {
    this.router.navigate(['/course', this.courseId, 'learn']);
  }
}