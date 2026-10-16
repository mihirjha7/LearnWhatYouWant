import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http'; 

import { Course } from '../../../models/instructor-dashboard';
import { WidgetComponent } from '../../widget/widget';
import { RawDashboardData } from '../../../models/instructor-dashboard'; 
import { SummaryCard } from '../../../models/widget-module'; 
import { DashboardService } from '../../../services/instructor-service';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true, 
  imports: [
    CommonModule, 
    WidgetComponent,
    MatIconModule, 
    MatButtonModule,
    HttpClientModule
  ],
  // Assuming the template and styles paths are correct
  templateUrl: './instructor-dashboard.html',
  styleUrls: ['./instructor-dashboard.css']
})
export class InstructorDashboardComponent implements OnInit {

  instructorName: string = 'Loading...'; 
  summaryCards: SummaryCard[] = []; 
  isLoading: boolean = true; 

  constructor(private dashboardService: DashboardService) { } 

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data: RawDashboardData) => {
        this.instructorName = data.instructorName; 
        
        this.summaryCards = this.mapRawMetricsToCards(data); 
        
        this.isLoading = false;
        console.log('API Name Received:', this.instructorName); 
      },
      error: (err) => {
        console.error('Error fetching dashboard data:', err);
        this.instructorName = 'Instructor'; 
        this.isLoading = false;
      }
    });
  }
  
 
  private mapRawMetricsToCards(metrics: RawDashboardData): SummaryCard[] {
      return [
        {
            title: 'Total Students',
            value: `${metrics.totalStudents}`, 
            trend: '+12.04%', 
            iconName: 'person', 
            colorClass: 'blue' 
        },
        {
            title: 'Total Course',
            value: `${metrics.totalCourses}`, 
            trend: '-12.11%', 
            iconName: 'library_books', 
            colorClass: 'green' 
        },
        {
            title: 'Total Video',
            value: `${metrics.totalVideos}`, 
            trend: '+25.21%',
            iconName: 'videocam', 
            colorClass: 'cyan' 
        },
        { 
            title: 'Total Earning', 
            value: metrics.totalEarning, 
            trend: '+25.21%', 
            iconName: 'payments', 
            colorClass: 'orange'
        }
      ];
  }
}
