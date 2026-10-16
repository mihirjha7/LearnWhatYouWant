import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../dashboard-layout/dashboard-layout';
import { DashboardNavItem } from '../../models/dashboard-layout-module';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, DashboardLayout, RouterOutlet],
  templateUrl: './student.html'
})
export class StudentLayout {
  navItems: DashboardNavItem[] = [
    { label: 'Dashboard', path: 'dashboard', icon: 'dashboard' },
    { label: 'My Learning', path: 'my-courses', icon: 'book' },
    { label: 'Review', path: 'review', icon: 'autorenew' },
    { label: 'Assessments', path: 'assessments', icon: 'quiz' },
    { label: 'Assignments', path: 'assignments', icon: 'assignment' },
    { label: 'Calendar', path: 'calendar', icon: 'calendar_today' },
    { label: 'Discussions', path: 'discussions', icon: 'forum' },
    { label: 'Notes', path: 'notes', icon: 'sticky_note_2' },
    { label: 'Skills', path: 'skills', icon: 'insights' },
    { label: 'Certificates', path: 'certificates', icon: 'workspace_premium' },
    { label: 'Live sessions', path: 'live', icon: 'videocam', featureFlag: 'liveLearning' },
    { label: 'Practice lab', path: '/learn/labs/lab-backoff', icon: 'terminal', featureFlag: 'labs' },
    { label: 'Quiz history', path: 'quizzes', icon: 'history' },
    { label: 'Messages', path: 'messages', icon: 'mail' },
    { label: 'Notifications', path: 'notifications', icon: 'notifications' },
    { label: 'Achievements', path: 'achievements', icon: 'emoji_events' },
    { label: 'Settings', path: 'settings', icon: 'settings' },
    { label: 'Profile', path: 'profile', icon: 'account_circle' }
  ];
}