import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { DashboardLayout } from '../../components/dashboard-layout/dashboard-layout';
import { DashboardNavItem } from '../../models/dashboard-layout-module';

@Component({
  selector: 'app-organization-layout',
  standalone: true,
  imports: [DashboardLayout, RouterOutlet],
  template: `<app-dashboard-layout [title]="'Organization · ' + organizationId" [navItems]="navItems"><router-outlet></router-outlet></app-dashboard-layout>`,
})
export class OrganizationLayout {
  protected readonly organizationId = inject(ActivatedRoute).snapshot.paramMap.get('organizationId') ?? '';
  protected readonly navItems: DashboardNavItem[] = [
    { label: 'Dashboard', path: 'dashboard', icon: 'dashboard' },
    { label: 'Members', path: 'members', icon: 'group' },
    { label: 'Cohorts', path: 'cohorts', icon: 'groups' },
    { label: 'Branding', path: 'branding', icon: 'palette' },
    { label: 'SSO', path: 'sso', icon: 'vpn_key' },
  ];
}
