// src/app/services/course.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Course } from '../models/course.model';
import { RuntimeConfigService } from '../core/config/runtime-config';

export interface EnrollmentStatus {
  isEnrolled: boolean;
  enrolledAt?: string;
  progress?: number; // optional
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private http = inject(HttpClient);
  private apiUrl = inject(RuntimeConfigService).apiBaseUrl;


  getCourse(courseId: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/Course/${courseId}`).pipe(
      map(c => ({
        ...c,
        lessons: [...(c.lessons ?? [])].sort((a, b) => a.orderIndex - b.orderIndex)
      }))
    );
  }

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/Course`);
  }

  isEnrolled(courseId: number): Observable<boolean> {
    return this.http
      .get<{isEnrolled: boolean}>(`${this.apiUrl}/Enrollment/is-enrolled/${courseId}`)
      .pipe(map(res => !!res?.isEnrolled));
  }

  enroll(courseId: number): Observable<void> {
    // Backend should infer user from JWT; if your API requires userId, add it to payload.
    return this.http.post<void>(`${this.apiUrl}/Enrollment`, { courseId });
  }
}