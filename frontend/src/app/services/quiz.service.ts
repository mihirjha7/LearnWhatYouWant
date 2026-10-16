import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CreateQuizRequest, CreateQuizResponse, Quiz, StartQuizResponse } from '../models/quiz.model';
import { CreateQuestionRequest } from '../models/question.model';
import { RuntimeConfigService } from '../core/config/runtime-config';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly apiUrl: string;
  private readonly apiUrlQuestion: string;

  constructor(
    private http: HttpClient,
    config: RuntimeConfigService,
  ) {
    this.apiUrl = config.apiUrl('Quiz');
    this.apiUrlQuestion = config.apiUrl('Question');
  }

  getQuizzesByCourse(courseId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(
      `${this.apiUrl}/get-by-courseId/${courseId}`,
    );
  }

  getQuizById(quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(
      `${this.apiUrl}/get-by-quizId/${quizId}`,
    );
  }

  startQuiz(quizId: number): Observable<StartQuizResponse> {
    return this.http.post<StartQuizResponse>(
      `${this.apiUrl}/start/${quizId}`,
      {},
    );
  }


createQuiz(payload: CreateQuizRequest): Observable<number> {
    return this.http.post<CreateQuizResponse>(`${this.apiUrl}`, payload).pipe(
      map((res) => {
        // Try common id keys: id, quizId, quizID
        const id = (res?.id ?? res?.quizId ?? res?.quizID);
        if (typeof id !== 'number') {
          console.warn('CreateQuiz response did not include a numeric id. Full response:', res);
          throw new Error('Quiz ID not found in response. Ensure API returns { id } or { quizId }.');
        }
        return id;
      })
    );
  }

  
/** POST /api/Question/{quizId} */
  createQuestion(quizId: number, payload: CreateQuestionRequest) {
    return this.http.post(`${this.apiUrlQuestion}/${quizId}`, payload);
  }

  
  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/all`);
  }

  getQuiz(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${id}`);
  }

  updateQuiz(id: number, payload: Partial<Omit<Quiz, 'id'>>): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.apiUrl}/${id}`, payload);
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
