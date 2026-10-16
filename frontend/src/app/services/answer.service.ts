import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Answer } from '../models/answer.model';
import { RuntimeConfigService } from '../core/config/runtime-config';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    config: RuntimeConfigService,
  ) {
    this.apiUrl = config.apiUrl('Answer');
  }

  submitAnswer(answer: Answer): Observable<Answer> {
    return this.http.post<Answer>(this.apiUrl, answer);
  }
}