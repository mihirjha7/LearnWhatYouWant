export type LearningStatus = 'active' | 'completed' | 'saved' | 'assigned' | 'archived';

export interface LearnerMetric {
  label: string;
  value: string;
  context: string;
  tone: 'brand' | 'progress' | 'warm' | 'neutral';
}

export interface ContinueLearningItem {
  courseId: string;
  legacyId?: number;
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  progress: number;
  lastActivity: string;
}

export interface LearnerPlanItem {
  id: string;
  timeLabel: string;
  title: string;
  context: string;
  type: 'lesson' | 'review' | 'assessment' | 'live';
  dueState: 'today' | 'upcoming' | 'overdue';
}

export interface LearnerRecommendation {
  id: string;
  title: string;
  reason: string;
  effortMinutes: number;
  targetSkill: string;
  courseId: string;
}

export interface MasterySummary {
  skill: string;
  mastery: number;
  evidenceCount: number;
}

export interface LearnerDashboardModel {
  metrics: readonly LearnerMetric[];
  continueLearning?: ContinueLearningItem;
  todayPlan: readonly LearnerPlanItem[];
  recommendations: readonly LearnerRecommendation[];
  mastery: readonly MasterySummary[];
  feedbackMessage?: string;
}

export interface LearnerCourseSummary {
  id: string;
  legacyId?: number;
  title: string;
  instructorName: string;
  category: string;
  progress: number;
  status: LearningStatus;
  nextLesson: string;
  lastAccessedAt: string;
  deadline?: string;
  durationMinutes: number;
  thumbnailUrl?: string;
}
