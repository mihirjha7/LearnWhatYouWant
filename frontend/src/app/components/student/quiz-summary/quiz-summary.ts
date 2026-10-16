



import { Component, OnInit, ViewChild, AfterViewInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { QuizSummary } from '../../../models/student.model';
import { EnrolledCourse } from '../../../models/student.model';
import { StudentCourseService } from '../../../services/student-course-service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-quiz-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // --- Material Modules ---
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatToolbarModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './quiz-summary.html',
  styleUrl: './quiz-summary.css'
})
export class QuizSummaryComponent implements OnInit, AfterViewInit {
  private studentCourseService = inject(StudentCourseService);
  private router = inject(Router);
  // Use a signal for loading state
  isLoading = signal(true);
  
  // All data storage
  allQuizzes: QuizSummary[] = [];
  enrolledCourses: EnrolledCourse[] = [];

  // MatTable Properties
  displayedColumns: string[] = ['srNo', 'quizTitle', 'highestScore', 'totalMarks', 'attemptsLeft', 'actions'];
  dataSource = new MatTableDataSource<QuizSummary>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filter Properties
  searchTerm: string = '';
  courseFilter: string = 'all'; // Course ID or 'all'
  statusFilter: string = 'all'; // 'completed', 'in_progress', 'not_started', 'no_attempts_left'

    ngOnInit(): void {
      // Fetch both courses (enrolled only) and categories in parallel
      forkJoin({
        courses: this.studentCourseService.getEnrolledCourses(), 
        quizzes: this.studentCourseService.getQuizSummary(), 
      }).subscribe({
        next: ({ courses, quizzes }) => {
          
          this.enrolledCourses = courses; 
          this.allQuizzes = quizzes;
          this.applyFilters();
          
          // 1. Set loading to false, which renders the mat-paginator in the DOM
          this.isLoading.set(false);
          
          // 2. CRITICAL FIX: Use setTimeout(0) to wait for the mat-paginator ViewChild to be initialized 
          // after the *ngIf condition has rendered it in the DOM.
          setTimeout(() => {
            this.setTableProperties();
          }, 0);
        },
        error: (err) => {
          console.error('Failed to fetch courses or categories:', err);
          this.isLoading.set(false);
        },
      });
    }

  ngAfterViewInit(): void {
    // The setup logic has been correctly moved to ngOnInit's subscription block.
    // The paginator is inside an *ngIf, making this lifecycle hook unreliable for it.
  }

  private setTableProperties(): void {
    // **Safety Check:** Ensure paginator is defined before assignment
    if (this.paginator) {
        this.dataSource.paginator = this.paginator;
    } else {
        console.error("MatPaginator ViewChild is undefined. Ensure it is rendered.");
    }
    
    this.dataSource.sort = this.sort;
    // Custom filter predicate to handle all filters
    this.dataSource.filterPredicate = (data: QuizSummary, filter: string) => {
        // The main applyFilters() function handles complex filtering by modifying dataSource.data
        // We only need the default search term check here for performance if not custom data is passed to the filter property
        const lowercasedTerm = this.searchTerm.toLowerCase();
        return data.quizTitle.toLowerCase().includes(lowercasedTerm);
    };
  }

  // Helper to determine the status of the quiz
  getQuizStatus(quiz: QuizSummary): 'attempted' | 'not_started' | 'no_attempts_left' {
    const hasAttempted = quiz.highestScore !== null;
    const canAttempt = quiz.attemptsLeft > 0;

    if (hasAttempted) return 'attempted';
    
    // If not attempted and no attempts left, use a special status for clarity
    if (!hasAttempted && !canAttempt) return 'no_attempts_left'; 
    
    // If not attempted and still has attempts left
    return 'not_started';
}

// Helper to get button color
getActionColor(quiz: QuizSummary): 'primary' | 'accent' | 'basic' {
    // If completed and no attempts left, view score (This is now part of 'attempted' status)
    if (quiz.highestScore !== null && quiz.attemptsLeft === 0) return 'accent'; 
    
    // Start/Retake (The main action button)
    if (quiz.attemptsLeft > 0) return 'primary'; 
    
    // Disabled/No Attempts Left
    return 'basic'; 
}

applyFilters(): void {
    let filteredQuizzes = [...this.allQuizzes];
    
    // 1. Course Filter
    if (this.courseFilter !== 'all') {
      const courseId = parseInt(this.courseFilter, 10);
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.courseID === courseId);
    }

    // 2. Status Filter (Modified for the new three statuses)
    if (this.statusFilter !== 'all') {
        const targetStatus = this.statusFilter; // Will be 'attempted', 'not_started', or 'no_attempts_left'
        filteredQuizzes = filteredQuizzes.filter(quiz => {
            const currentStatus = this.getQuizStatus(quiz);

            if (targetStatus === 'attempted') {
                return currentStatus === 'attempted';
            }
            
            // "Not Started" includes quizzes that have attempts left but no score
            if (targetStatus === 'not_started') {
                return currentStatus === 'not_started';
            }
            
            // Explicitly filter for "No Attempts Left" only if needed, 
            // though usually this is a subset of 'Attempted' or 'Not Started' in this logic.
            if (targetStatus === 'no_attempts_left') {
                 return currentStatus === 'no_attempts_left';
            }

            return false;
        });
    }

    // 3. Search Term Filter (Quiz Title)
    if (this.searchTerm) {
      const lowercasedTerm = this.searchTerm.toLowerCase();
      filteredQuizzes = filteredQuizzes.filter(
        (quiz) => quiz.quizTitle.toLowerCase().includes(lowercasedTerm)
      );
    }

    // Update the MatTableDataSource
    this.dataSource.data = filteredQuizzes;

    // Go back to the first page when filtering
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
}

handleQuizAction(quiz: QuizSummary): void {
    const courseId = quiz.courseID;
    const quizId = quiz.quizID;
    let action: string;

    // **Attempted** but no attempts left -> View Score
    if (quiz.highestScore !== null && quiz.attemptsLeft === 0) {
        action = 'View Score (Completed)';
        
        // Navigate to the results page for the course
        //this.router.navigate(['/course', courseId, 'quiz', 'results']); 
    
    // **Attempted** or **Not Started** but attempts left -> Retake/Start
    } else if (quiz.attemptsLeft > 0) {
        action = quiz.highestScore !== null ? 'Retake Quiz' : 'Start Quiz';
        
        // Navigate to the quiz attempt page
        this.router.navigate(['/course', courseId, 'quiz', quizId, 'attempt']);
    
    // No action (No Attempts Left, no score)
    } else {
        return;
    }
    
    console.log(`${action} triggered for Quiz: ${quiz.quizTitle} (ID: ${quiz.quizID})`);
}

}