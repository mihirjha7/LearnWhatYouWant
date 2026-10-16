import { Provider } from '@angular/core';
import { AdminConsoleGateway } from './contracts/admin-console.contracts';
import { AdvancedLearningGateway } from './contracts/advanced-learning.contracts';
import { AssessmentGateway } from './contracts/assessment.contracts';
import { InstructorGateway } from './contracts/instructor.contracts';
import { LearningActivityGateway } from './contracts/learning-activity.contracts';
import { MockAdminConsoleGateway } from './mock/mock-admin-console.gateway';
import { MockAdvancedLearningGateway } from './mock/mock-advanced-learning.gateway';
import { MockAssessmentGateway } from './mock/mock-assessment.gateway';
import { MockInstructorGateway } from './mock/mock-instructor.gateway';
import { MockLearningActivityGateway } from './mock/mock-learning-activity.gateway';

/**
 * Domains without an approved /api/v1 contract (BLK-002) bind to mock gateways.
 * Swap `useExisting` per domain once a legacy or ApiV1 adapter passes its contract tests.
 */
export function provideGateways(): Provider[] {
  return [
    { provide: AssessmentGateway, useExisting: MockAssessmentGateway },
    { provide: LearningActivityGateway, useExisting: MockLearningActivityGateway },
    { provide: InstructorGateway, useExisting: MockInstructorGateway },
    { provide: AdminConsoleGateway, useExisting: MockAdminConsoleGateway },
    { provide: AdvancedLearningGateway, useExisting: MockAdvancedLearningGateway },
  ];
}
