import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AttemptResult } from '../../data-access/contracts/assessment.contracts';
import { MockAssessmentGateway } from '../../data-access/mock/mock-assessment.gateway';

describe('MockAssessmentGateway', () => {
  let gateway: MockAssessmentGateway;

  beforeEach(() => {
    window.localStorage.removeItem('learnova_mock_assessments_v1');
    TestBed.configureTestingModule({});
    gateway = TestBed.inject(MockAssessmentGateway);
  });

  afterEach(() => window.localStorage.removeItem('learnova_mock_assessments_v1'));

  it('grades objective attempts on the simulated server and replays idempotent submissions', fakeAsync(() => {
    let attemptId = '';
    gateway.startOrResumeAttempt('asm-angular-checkpoint').subscribe((attempt) => (attemptId = attempt.id));
    tick(500);
    expect(attemptId).toBeTruthy();

    gateway.saveResponses(attemptId, { q1: 'b', q2: ['a', 'b'], q3: 'true', q4: { l1: 'r1', l2: 'r2', l3: 'r3' }, q5: ['o1', 'o2', 'o3', 'o4'], q6: 'Computed' }, []).subscribe();
    tick(500);

    let first: AttemptResult | undefined;
    let second: AttemptResult | undefined;
    gateway.submitAttempt(attemptId, 'key-1').subscribe((result) => (first = result));
    tick(500);
    gateway.submitAttempt(attemptId, 'key-1').subscribe((result) => (second = result));
    tick(500);

    expect(first?.status).toBe('graded');
    expect(first?.scorePercent).toBe(100);
    expect(second?.attemptId).toBe(first?.attemptId);
  }));

  it('marks manually graded questions as pending', fakeAsync(() => {
    let attemptId = '';
    gateway.startOrResumeAttempt('asm-api-practical').subscribe((attempt) => (attemptId = attempt.id));
    tick(500);
    let result: AttemptResult | undefined;
    gateway.submitAttempt(attemptId, 'key-2').subscribe((value) => (result = value));
    tick(1000);
    expect(result?.status).toBe('pending-grading');
    expect(result?.scorePercent).toBeNull();
  }));

  it('refuses to start an assessment that is not open yet', fakeAsync(() => {
    let status = 0;
    gateway.startOrResumeAttempt('asm-data-upcoming').subscribe({ error: (error: { status: number }) => (status = error.status) });
    tick(500);
    expect(status).toBe(409);
  }));
});
