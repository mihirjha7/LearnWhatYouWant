// src/app/services/admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { User} from '../models/interfaces';
import { Course } from '../models/course.model';

import { forkJoin, map } from 'rxjs';
import { Category } from '../models/interfaces';


import { RuntimeConfigService } from '../core/config/runtime-config';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = inject(RuntimeConfigService).apiBaseUrl;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/UserManagement/admin/users`);
  }

  getUsersByRole(role: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/UserManagement/admin/users/role/${role}`);
  }

  fetchDashboardData(): Observable<{ students: User[]; instructors: User[]; admins: User[] }> {
    // Use forkJoin with a key-value object for a cleaner response
    return forkJoin({
      students: this.getUsersByRole(1),
      instructors: this.getUsersByRole(2),
      admins: this.getUsersByRole(3),
    });
  }

  updateUserStatus(email: string, isActive: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/UserManagement/admin/users/status`, { email, isActive });
  }

  deleteUser(email: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/UserManagement/admin/users`, { body: { email } });
  }

  
  // This method was already here, now we ensure it's used.
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/Course`);
  }

  // New method to fetch categories for the filter dropdown
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/CourseCategories`);
  }

  // New method to publish or unpublish a course
  updateCourseStatus(courseID: number, published: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/Course/status/${courseID}`, { published });
  }
}
