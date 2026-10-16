import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RuntimeConfigService } from '../../core/config/runtime-config';
import { PreferencesService } from '../../core/preferences/preferences.service';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly preferences = inject(PreferencesService);
  protected imagePreviewUrl: string | null = null;
  private readonly userService = inject(UserService);
  private readonly config = inject(RuntimeConfigService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) return;

    this.userService
      .getUserProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => (this.imagePreviewUrl = this.config.uploadUrl(profile.profilePicture)),
      });
  }

  protected dashboardLink(): string {
    const role = this.authService.getUserRole();
    if (role === 'Admin') return '/admin/dashboard';
    if (role === 'Instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  }

  protected userInitial(): string {
    return this.authService.getCurrentUser()?.displayName.trim().charAt(0).toUpperCase() || 'U';
  }

  protected logout(): void {
    this.authService.logout();
  }
}
