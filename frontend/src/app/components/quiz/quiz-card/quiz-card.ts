import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Quiz } from '../../../models/quiz.model';

@Component({
  selector: 'app-quiz-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './quiz-card.html',
  styleUrls: ['./quiz-card.scss']
})
export class QuizCardComponent {
  @Input() quiz!: Quiz;
  @Output() startQuiz = new EventEmitter<number>();

  onStartQuiz() {
    this.startQuiz.emit(this.quiz.quizID);
  }
}