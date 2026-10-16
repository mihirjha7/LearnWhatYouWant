import { Injectable, inject } from '@angular/core';
import { DraftStorageService } from '../core/storage/draft-storage.service';
import { AnswerResult } from '../models/answer.model';

export interface QuizResultsData {
  score: number;
  totalMarks: number;
  answers: AnswerResult[];
  attemptNumber: number;
  quizTitle: string;
  courseId: number;
  quizId: number;
  submittedAt: string;
}

@Injectable({ providedIn: 'root' })
export class QuizResultsService {
  private readonly drafts = inject(DraftStorageService);
  private resultsData: QuizResultsData | null = null;

  setResults(data: QuizResultsData): void {
    this.resultsData = data;
    this.drafts.write('quiz_results', JSON.stringify(data));
  }

  getResults(expectedCourseId?: number): QuizResultsData | null {
    if (this.resultsData) return this.matchesCourse(this.resultsData, expectedCourseId) ? this.resultsData : null;
    const stored = this.drafts.read('quiz_results');
    if (!stored) return null;

    try {
      const value = JSON.parse(stored) as Partial<QuizResultsData>;
      if (
        typeof value.score !== 'number' ||
        typeof value.totalMarks !== 'number' ||
        typeof value.courseId !== 'number' ||
        typeof value.quizId !== 'number' ||
        typeof value.quizTitle !== 'string' ||
        !Array.isArray(value.answers)
      ) {
        return null;
      }
      this.resultsData = value as QuizResultsData;
      return this.matchesCourse(this.resultsData, expectedCourseId) ? this.resultsData : null;
    } catch {
      return null;
    }
  }

  clearResults(): void {
    this.resultsData = null;
    this.drafts.write('quiz_results', '');
  }

  private matchesCourse(data: QuizResultsData, courseId?: number): boolean {
    return courseId === undefined || data.courseId === courseId;
  }
}
