import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { QuizEditDialogComponent } from '../quiz-edit/quiz-edit';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialoge-box/confirm-dialoge-box';
import { QuizService } from '../../../../services/quiz.service';
import { Quiz } from '../../../../models/quiz.model';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './quiz-list-view.html',
  styleUrls: [`./quiz-list-view.css`]
})
export class QuizListComponent implements OnInit {
  private svc = inject(QuizService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  displayedColumns = ['quizID', 'title', 'courseID', 'totalMarks', 'timeLimit', 'attemptsAllowed', 'actions'];
  dataSource = new MatTableDataSource<Quiz>([]);
  loading = signal(false);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getQuizzes().subscribe({
      next: (rows) => {
        console.log('Quizzes loaded', rows);
        this.dataSource = new MatTableDataSource(rows);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (data, filter) => {
          const f = filter.trim().toLowerCase();
          return data.title!.toLowerCase().includes(f) ||
                 String(data.courseID).includes(f);
        };
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
        this.snack.open('Failed to load quizzes', 'Dismiss', { duration: 3000 });
      }
    });
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  openEdit(quiz: Quiz) {
    const ref = this.dialog.open(QuizEditDialogComponent, {
      width: '520px',
      data: { quiz }
    });
    ref.afterClosed().subscribe(updated => {
      if (updated) {
        this.snack.open('Quiz updated', 'OK', { duration: 2000 });
        // Update the row in the table
        const idx = this.dataSource.data.findIndex(q => q.quizID === updated.quizID);
        if (idx > -1) {
          const newData = [...this.dataSource.data];
          newData[idx] = updated;
          this.dataSource.data = newData;
        } else {
          this.load();
        }
      }
    });
  }

  goToQuestions(quizId: number) {
    // Navigate to builder with quizId to add questions directly
    this.router.navigate(['/quiz-builder'], { queryParams: { quizId } });
  }

  confirmDelete(quiz: Quiz) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Quiz',
        message: `Are you sure you want to delete “${quiz.title}” (ID: ${quiz.quizID})? This cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.loading.set(true);
        this.svc.deleteQuiz(quiz.quizID).subscribe({
          next: () => {
            this.loading.set(false);
            this.snack.open('Quiz deleted', 'OK', { duration: 2000 });
            this.dataSource.data = this.dataSource.data.filter(q => q.quizID !== quiz.quizID);
          },
          error: (err) => {
            this.loading.set(false);
            console.error(err);
            this.snack.open('Failed to delete quiz', 'Dismiss', { duration: 3000 });
          }
        });
      }
    });
  }
}