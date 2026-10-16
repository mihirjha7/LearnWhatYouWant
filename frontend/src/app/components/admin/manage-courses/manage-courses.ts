// src/app/components/admin/manage-courses/manage-courses.ts
import { Component, inject, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Course } from '../../../models/course.model';
import { Category } from '../../../models/interfaces';
import { AdminService } from '../../../services/admin-service';
import { DurationFormatPipe } from '../../shared/pipes/duration-format-pipe';

import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog'

@Component({
  selector: 'app-manage-courses',
  standalone: true, // Mark component as standalone
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    DurationFormatPipe
  ],
  templateUrl: './manage-courses.html',
  styleUrl: './manage-courses.css',
})
export class ManageCourses implements OnInit {
  adminService = inject(AdminService);
  private dialog = inject(MatDialog); // Inject the MatDialog service

  isLoading = true;
  allCourses: Course[] = [];
  filteredCourses: Course[] = [];
  allCategories: Category[] = [];

  searchTerm: string = '';
  categoryFilter: string = 'all';
  statusFilter: string = 'all';

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      courses: this.adminService.getCourses(),
      categories: this.adminService.getCategories(),
    }).subscribe({
      next: ({ courses, categories }) => {
        this.allCourses = courses;
        this.allCategories = categories;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load course data', err);
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    let courses = [...this.allCourses];
    if (this.statusFilter !== 'all') {
      courses = courses.filter(c => c.published === (this.statusFilter === 'published'));
    }
    if (this.categoryFilter !== 'all') {
      courses = courses.filter(c => c.categoryID === +this.categoryFilter);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      );
    }
    this.filteredCourses = courses;
  }

  getCategoryName(categoryId: number): string {
    return this.allCategories.find(c => c.categoryID === categoryId)?.name || 'Uncategorized';
  }

  togglePublishStatus(course: Course): void {
    const action = course.published ? 'Unpublish' : 'Publish';
    
    // --- Use MatDialog instead of confirm() ---
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `${action} Course`,
        message: `Are you sure you want to ${action.toLowerCase()} the course "${course.title}"?`,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const newStatus = !course.published;
        this.adminService.updateCourseStatus(course.courseID, newStatus).subscribe({
          next: () => {
            const courseInAll = this.allCourses.find(c => c.courseID === course.courseID);
            if (courseInAll) courseInAll.published = newStatus;
            this.applyFilters();
          },
          error: (err) => console.error('Failed to update course status', err),
        });
      }
    });
  }
}