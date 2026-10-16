import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuizScore, QuizScoreResponse } from '../models/quiz-score.model';
import { RuntimeConfigService } from '../core/config/runtime-config';

@Injectable({ providedIn: 'root' })
export class QuizScoreService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    config: RuntimeConfigService,
  ) {
    this.apiUrl = config.apiUrl('QuizScore');
  }

  submitQuizScore(quizScore: QuizScore): Observable<QuizScoreResponse> {
    return this.http.post<QuizScoreResponse>(
      `${this.apiUrl}/submit`,
      quizScore,
    );
  }

  getQuizScoresByCourse(courseId: number): Observable<QuizScoreResponse[]> {
    return this.http.get<QuizScoreResponse[]>(
      `${this.apiUrl}/course/${courseId}`,
    );
  }
}
