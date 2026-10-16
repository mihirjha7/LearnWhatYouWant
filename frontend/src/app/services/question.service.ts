
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from '../models/question.model';
import { RuntimeConfigService } from '../core/config/runtime-config';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    config: RuntimeConfigService,
  ) {
    this.apiUrl = config.apiUrl('Question');
  }

  getQuestionsByQuiz(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/quiz/${quizId}`);
  }

  getQuestionById(questionId: number): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/${questionId}`);
  }
}