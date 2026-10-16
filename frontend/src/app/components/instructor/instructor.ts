import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../dashboard-layout/dashboard-layout';
import { DashboardNavItem } from '../../models/dashboard-layout-module';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-instructor',
  standalone: true,
  imports: [CommonModule, DashboardLayout, RouterOutlet],
  templateUrl: './instructor.html',
  styleUrls: ['./instructor.css',]
})
export class InstructorLayout {
  navItems: DashboardNavItem[] = [
    { label: 'Overview', path: 'dashboard', icon: 'dashboard' },
    { label: 'Course studio', path: 'studio', icon: 'edit_note' },
    { label: 'My courses', path: 'courses', icon: 'book' },
    { label: 'Question bank', path: 'question-bank', icon: 'quiz' },
    { label: 'Grading', path: 'grading', icon: 'grading' },
    { label: 'Analytics', path: 'analytics', icon: 'insights' },
    { label: 'Live sessions', path: 'live', icon: 'videocam', featureFlag: 'liveLearning' },
    { label: 'Profile', path: 'profile', icon: 'account_circle' }
  ];
}
