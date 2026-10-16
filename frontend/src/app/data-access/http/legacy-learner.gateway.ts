import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { EnrolledCourse, StudentDashboardData } from '../../models/student.model';
import { StudentCourseService } from '../../services/student-course-service';
import { LearnerGateway } from '../contracts/learner.gateway';
import { LearnerCourseSummary, LearnerDashboardModel, MasterySummary } from '../contracts/learner.models';

@Injectable({ providedIn: 'root' })
export class LegacyLearnerGateway implements LearnerGateway {
  private readonly service = inject(StudentCourseService);

  getDashboard(): Observable<LearnerDashboardModel> {
    return forkJoin({ summary: this.service.getDashboardSummary(), courses: this.service.getEnrolledCourses() }).pipe(
      map(({ summary, courses }) => this.toDashboard(summary, courses.map((course) => this.toCourse(course)))),
    );
  }

  getMyLearning(): Observable<readonly LearnerCourseSummary[]> {
    return this.service.getEnrolledCourses().pipe(map((courses) => courses.map((course) => this.toCourse(course))));
  }

  private toDashboard(summary: StudentDashboardData, courses: LearnerCourseSummary[]): LearnerDashboardModel {
    const activeCourses = courses.filter((course) => course.status === 'active' || course.status === 'assigned');
    const mastery: MasterySummary[] = (summary.courseAverageScores ?? []).map((score) => ({ skill: score.courseName || score.courseTitle, mastery: Math.max(0, Math.min(100, Math.round(score.averageScore ?? 0))), evidenceCount: 1 }));
    const firstCourse = activeCourses[0];
    return {
      metrics: [
        { label: 'Courses enrolled', value: String(summary.enrolledCoursesCount ?? 0), context: `${summary.completedCoursesCount ?? 0} completed`, tone: 'brand' },
        { label: 'Courses active', value: String(Math.max(0, (summary.enrolledCoursesCount ?? 0) - (summary.completedCoursesCount ?? 0))), context: 'Ready to continue', tone: 'progress' },
        { label: 'Quizzes taken', value: String(summary.uniqueQuizzesAttempted ?? 0), context: 'Unique assessments', tone: 'warm' },
        { label: 'Skills tracked', value: String(mastery.length), context: 'Based on available scores', tone: 'neutral' },
      ],
      continueLearning: firstCourse ? { courseId: firstCourse.id, legacyId: firstCourse.legacyId, courseTitle: firstCourse.title, moduleTitle: 'Continue your course', lessonTitle: firstCourse.nextLesson, progress: firstCourse.progress, lastActivity: firstCourse.lastAccessedAt } : undefined,
      todayPlan: activeCourses.slice(0, 2).map((course, index) => ({ id: `legacy-plan-${course.id}`, timeLabel: index ? 'Later' : 'Next', title: course.nextLesson, context: course.title, type: 'lesson' as const, dueState: 'today' as const })),
      recommendations: [],
      mastery,
    };
  }

  private toCourse(course: EnrolledCourse): LearnerCourseSummary {
    const progress = Math.max(0, Math.min(100, Number(course.progress) || 0));
    const completion = course.completionStatus?.toLowerCase() ?? '';
    return { id: String(course.courseID), legacyId: course.courseID, title: course.title, instructorName: course.instructor || 'Learnova instructor', category: `Category ${course.categoryID}`, progress, status: progress >= 100 || completion.includes('complete') ? 'completed' : 'active', nextLesson: course.lessons?.find((lesson) => lesson.orderIndex > 0)?.title ?? 'Continue course', lastAccessedAt: course.enrollmentDate, durationMinutes: Math.round((course.duration ?? 0) * 60), thumbnailUrl: course.thumbnailURL };
  }
}
