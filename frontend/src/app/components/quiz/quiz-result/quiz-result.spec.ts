import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { QuizResultsComponent } from './quiz-result';

describe('QuizResultsComponent', () => {
  let component: QuizResultsComponent;
  let fixture: ComponentFixture<QuizResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizResultsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
