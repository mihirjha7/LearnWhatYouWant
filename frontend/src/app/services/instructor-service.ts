import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs'; 
import { map } from 'rxjs/operators';

import { InstructorProfileApi} from '../models/instructor-dashboard'; 
import { RawDashboardData } from '../models/instructor-dashboard';
import { RuntimeConfigService } from '../core/config/runtime-config';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = inject(RuntimeConfigService).apiBaseUrl;

  getDashboardData(): Observable<RawDashboardData> {
    const user$ = this.http.get<InstructorProfileApi>(`${this.apiUrl}/UserManagement/me`);
    
    const analytics$ = this.http.get<any>(`${this.apiUrl}/UserManagement/instructor/analytics`);

    const totalEarning$ = of('$8,015.30'); 

    
    return forkJoin({ user: user$, analytics: analytics$, totalEarning: totalEarning$ }).pipe(
      map(results => {
        
        return {
            instructorName: results.user.name || 'Instructor', 
            totalStudents: results.analytics.totalStudents,
            totalCourses: results.analytics.totalCourses,
            totalVideos: results.analytics.totalVideos,
            totalEarning: results.totalEarning // Mocked
        };
      })
    );
  }
}
