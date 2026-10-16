import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardSummary, User } from '../../../models/interfaces';
import { AdminService } from '../../../services/admin-service';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { ChartData, ChartOptions } from 'chart.js';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseChartDirective,
    
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class AdminDashboard implements OnInit, AfterViewInit {
  summary: DashboardSummary | null = null;
  isLoading = true;
  error: string | null = null;

  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'lastLogin'];
  dataSource = new MatTableDataSource<User>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
  };
  public pieChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  public pieChartLegend = true;

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Active Users', 'Inactive Users'],
    datasets: [{ data: [], backgroundColor: ['#00BCD4', '#f44336'] }], // Use Cyan & Warn Red
  };
  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }
  
  ngAfterViewInit(): void {
    // Link paginator and sort to the data source after view init
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData(): void {
    this.isLoading = true;
    this.adminService.fetchDashboardData().subscribe({
      next: ({ students, instructors, admins }) => {
        const allUsers = [...students, ...instructors, ...admins];

        this.summary = {
          totalUsers: allUsers.length,
          activeUsers: allUsers.filter((u) => u.isActive).length,
          roles: {
            Student: students.length,
            Instructor: instructors.length,
            Admin: admins.length,
          },
        };

        this.dataSource.data = allUsers;
        // console.log('All Users:', allUsers);
        //set Chart Data
        this.pieChartData = {
          labels: ['Students', 'Instructors', 'Admins'],
          datasets: [{
            data: [students.length, instructors.length, admins.length],
            // Use your theme colors!
            backgroundColor: ['#00BCD4', '#FF9800', '#9E9E9E'], // Cyan, Orange, Grey
          }],
        };
        
        this.doughnutChartData.datasets[0].data = [
          this.summary.activeUsers,
          this.summary.totalUsers - this.summary.activeUsers,
        ];
        
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch dashboard data.';
        this.isLoading = false;
        console.error(err);
      },
    });
  }
}