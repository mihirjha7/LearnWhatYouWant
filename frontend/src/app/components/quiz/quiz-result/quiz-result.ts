import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/notifications/notification.service';
import { QuizResultsData, QuizResultsService } from '../../../services/quiz-results.service';

@Component({ selector: 'app-quiz-results', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './quiz-result.html', styleUrl: './quiz-result.scss' })
export class QuizResultsComponent implements OnInit {
  protected readonly results = signal<QuizResultsData | null>(null);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly resultsService = inject(QuizResultsService);
  private readonly notifications = inject(NotificationService);

  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.results.set(this.resultsService.getResults(Number.isInteger(courseId) ? courseId : undefined));
  }

  protected percentage(result: QuizResultsData): number {
    return result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0;
  }

  protected correctCount(result: QuizResultsData): number {
    return result.answers.filter((answer) => answer.isCorrect).length;
  }

  protected outcomeLabel(result: QuizResultsData): string {
    const percentage = this.percentage(result);
    if (percentage >= 85) return 'Strong evidence of mastery';
    if (percentage >= 70) return 'Good progress with a few gaps';
    if (percentage >= 50) return 'Developing understanding';
    return 'More practice will help';
  }

  protected retake(result: QuizResultsData): void {
    this.resultsService.clearResults();
    void this.router.navigate(['/course', result.courseId, 'quiz', result.quizId, 'attempt']);
  }

  protected async share(result: QuizResultsData): Promise<void> {
    const text = `I completed ${result.quizTitle} with ${result.score}/${result.totalMarks} on Learnova.`;
    try {
      if (navigator.share) await navigator.share({ title: 'Learnova assessment result', text });
      else await navigator.clipboard.writeText(text);
      this.notifications.show('Result ready to share', { tone: 'success' });
    } catch {
      this.notifications.show('Sharing was cancelled or unavailable', { tone: 'info' });
    }
  }
}
