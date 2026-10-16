// src/app/services/student-course.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UserProfile, UpdateBioRequest, QuizSummary, StudentDashboardData } from '../models/student.model'; 
import { EnrolledCourse } from '../models/student.model'; // Assuming EnrolledCourse is defined here
import { DashboardSummary } from '../models/student.model';
import { Category } from '../models/interfaces'; // Assuming Category model is defined here
import { RuntimeConfigService } from '../core/config/runtime-config';


@Injectable({
  providedIn: 'root',
})
export class StudentCourseService {
  private http = inject(HttpClient);
  private apiUrl = inject(RuntimeConfigService).apiBaseUrl;
  private userManagementBaseUrl = `${this.apiUrl}/UserManagement`;

  getEnrolledCourses(): Observable<EnrolledCourse[]> {
    return this.http.get<EnrolledCourse[]>(`${this.apiUrl}/Enrollment/user/courses`);
  }

 
   
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/CourseCategories`);
  }

   

  
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.userManagementBaseUrl}/me`);
  }


  updateBio(bioData: UpdateBioRequest): Observable<{ Message: string; UpdatedAt: Date }> {
    // The request body must match UserUpdateProfileBioDto, which contains a 'Bio' property.
    return this.http.put<{ Message: string; UpdatedAt: Date }>(
      `${this.userManagementBaseUrl}/me/bio`,
      bioData
    );
  }

  uploadProfilePicture(file: File): Observable<{ FileName: string; Message: string }> {
    const formData = new FormData();
    // The name 'file' must match the parameter name (IFormFile file) in the backend controller.
    formData.append('file', file, file.name);

    return this.http.post<{ FileName: string; Message: string }>(
      `${this.userManagementBaseUrl}/me/profilePicture`,
      formData
    );
  }
  
  getDashboardSummary(): Observable<StudentDashboardData> {
    return this.http.get<StudentDashboardData>(
      `${this.userManagementBaseUrl}/student/dashboardSummary`
    );
  }

  getQuizSummary(): Observable<any> {
    return this.http.get<QuizSummary[]>(
      `${this.apiUrl}/Quiz/summary`
    );
  }

}









