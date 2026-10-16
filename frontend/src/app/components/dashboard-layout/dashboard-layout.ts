import { CommonModule } from '@angular/common';
import { Component, Input, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DashboardNavItem } from '../../models/dashboard-layout-module';
import { PreferencesService } from '../../core/preferences/preferences.service';
import { AuthService } from '../../services/auth-service';
import { RuntimeConfigService } from '../../core/config/runtime-config';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {
  @Input() title = 'Workspace';
  @Input() navItems: DashboardNavItem[] = [];

  protected readonly isCollapsed = signal(false);
  protected readonly isMobileNavOpen = signal(false);
  protected readonly preferences = inject(PreferencesService);
  private readonly authService = inject(AuthService);
  private readonly config = inject(RuntimeConfigService);

  protected get visibleItems(): DashboardNavItem[] {
    return this.navItems.filter((item) => !item.featureFlag || this.config.isFeatureEnabled(item.featureFlag));
  }

  protected get userName(): string {
    return this.authService.getCurrentUser()?.displayName ?? 'Account';
  }

  protected get userInitial(): string {
    return this.userName.trim().charAt(0).toUpperCase() || 'U';
  }

  protected toggleSidebar(): void {
    this.isCollapsed.update((value) => !value);
  }

  protected toggleMobileNav(): void {
    this.isMobileNavOpen.update((value) => !value);
  }

  protected closeMobileNav(): void {
    this.isMobileNavOpen.set(false);
  }

  protected logout(): void {
    this.authService.logout();
  }
}
