import { LearnerCourseSummary, LearnerDashboardModel } from '../contracts/learner.models';

export const MOCK_LEARNER_COURSES: readonly LearnerCourseSummary[] = [
  { id: 'modern-angular', title: 'Modern Angular in Practice', instructorName: 'Arjun Rao', category: 'Development', progress: 68, status: 'active', nextLesson: 'Model feature state with signals', lastAccessedAt: '2026-08-30T09:20:00Z', durationMinutes: 540 },
  { id: 'data-storytelling', title: 'Data Storytelling for Decisions', instructorName: 'Elena Torres', category: 'Data', progress: 34, status: 'active', nextLesson: 'Choose the chart that answers the question', lastAccessedAt: '2026-08-28T14:10:00Z', deadline: '2026-09-08T17:00:00Z', durationMinutes: 300 },
  { id: 'web-accessibility-foundations', title: 'Accessible Web Experiences', instructorName: 'Maya Chen', category: 'Design & UX', progress: 100, status: 'completed', nextLesson: 'Course complete', lastAccessedAt: '2026-08-22T16:00:00Z', durationMinutes: 360 },
  { id: 'security-mindset', title: 'A Practical Security Mindset', instructorName: 'Avery Morgan', category: 'Security', progress: 12, status: 'assigned', nextLesson: 'Recognize common threat patterns', lastAccessedAt: '2026-08-25T11:30:00Z', deadline: '2026-09-15T17:00:00Z', durationMinutes: 270 },
  { id: 'product-leadership', title: 'Product Leadership Essentials', instructorName: 'Noah Williams', category: 'Leadership', progress: 0, status: 'saved', nextLesson: 'Start here', lastAccessedAt: '2026-08-18T08:00:00Z', durationMinutes: 420 },
];

export const MOCK_LEARNER_DASHBOARD: LearnerDashboardModel = {
  metrics: [
    { label: 'Weekly focus', value: '3h 40m', context: '40 minutes above your plan', tone: 'brand' },
    { label: 'Courses active', value: '3', context: 'One deadline this week', tone: 'progress' },
    { label: 'Reviews due', value: '8', context: 'About 12 minutes', tone: 'warm' },
    { label: 'Skills evidenced', value: '12', context: 'Three verified this month', tone: 'neutral' },
  ],
  continueLearning: { courseId: 'modern-angular', courseTitle: 'Modern Angular in Practice', moduleTitle: 'State that stays understandable', lessonTitle: 'Model feature state with signals', progress: 68, lastActivity: '2026-08-30T09:20:00Z' },
  todayPlan: [
    { id: 'plan-1', timeLabel: '20 min', title: 'Model feature state with signals', context: 'Modern Angular in Practice', type: 'lesson', dueState: 'today' },
    { id: 'plan-2', timeLabel: '12 min', title: 'Review 8 concepts before they fade', context: 'Daily review queue', type: 'review', dueState: 'today' },
    { id: 'plan-3', timeLabel: 'Fri', title: 'Visual hierarchy checkpoint', context: 'Data Storytelling for Decisions', type: 'assessment', dueState: 'upcoming' },
  ],
  recommendations: [
    { id: 'recommendation-1', title: 'Practice observable error recovery', reason: 'Your last two checks show confidence with happy paths and hesitation around retries.', effortMinutes: 18, targetSkill: 'RxJS resilience', courseId: 'modern-angular' },
    { id: 'recommendation-2', title: 'Refresh chart selection', reason: 'This prepares you for Friday’s visual hierarchy checkpoint.', effortMinutes: 10, targetSkill: 'Data visualization', courseId: 'data-storytelling' },
  ],
  mastery: [
    { skill: 'Angular components', mastery: 82, evidenceCount: 7 },
    { skill: 'Reactive data flow', mastery: 64, evidenceCount: 5 },
    { skill: 'Accessible interaction', mastery: 91, evidenceCount: 9 },
    { skill: 'Data communication', mastery: 58, evidenceCount: 4 },
  ],
  feedbackMessage: 'Strong work on semantic structure. Next, explain why your focus order supports the task.',
};
