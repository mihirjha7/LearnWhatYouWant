import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizCardComponent } from './quiz-card';

describe('QuizCardComponent', () => {
  let component: QuizCardComponent;
  let fixture: ComponentFixture<QuizCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizCardComponent);
    component = fixture.componentInstance;
    component.quiz = { quizID: 1, courseID: 1, title: 'Checkpoint', totalMarks: 10, timeLimit: 20, attemptsAllowed: 2, createdAt: null, questions: [] };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
