
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterOutlet } from '@angular/router';


import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { DashboardNavItem } from '../../../models/dashboard-layout-module';
import { DashboardLayout } from "../../dashboard-layout/dashboard-layout";


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    DashboardLayout
],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
})
export class AdminLayout {


  navItems: DashboardNavItem[] = [
      { label: 'Overview', path: 'dashboard', icon: 'dashboard' },
      { label: 'Users', path: 'users', icon: 'person' },
      { label: 'Courses', path: 'courses', icon: 'book' },
      { label: 'Moderation', path: 'moderation', icon: 'gavel' },
      { label: 'Roles', path: 'roles', icon: 'admin_panel_settings' },
      { label: 'Organizations', path: 'organizations', icon: 'domain' },
      { label: 'Audit log', path: 'audit', icon: 'receipt_long' },
      { label: 'Integrations', path: 'integrations', icon: 'hub' },
      { label: 'Jobs', path: 'jobs', icon: 'schedule' },
      { label: 'System health', path: 'system-health', icon: 'monitor_heart' },
      { label: 'Feature flags', path: 'feature-flags', icon: 'flag' },
      { label: 'User insights', path: 'insights', icon: 'bar_chart' },
      { label: 'Profile', path: 'profile', icon: 'account_circle' }
    ];
}