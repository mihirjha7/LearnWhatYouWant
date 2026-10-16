// user-profile.ts
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserService } from '../../../services/user-service'
import { UserProfile } from '../../../models/interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RuntimeConfigService } from '../../../core/config/runtime-config';


@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class ProfileComponent implements OnInit {
  activeLink = 'public-profile'; // Default active link
  userName: string = '';
  photoURL: string | null = ''; // Changed to null to match the possibility of no photo

  private router = inject(Router);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private config = inject(RuntimeConfigService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // Determine active link based on current route
    this.activeLink = this.router.url.includes('/photo') ? 'photo' : 'public-profile';
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.activeLink = this.router.url.includes('/photo') ? 'photo' : 'public-profile';
    });

    // FIX 2: Continuous subscription to profile updates.
    // This assumes userService.getUserProfile() returns an observable (e.g., BehaviorSubject)
    // that emits whenever the underlying data changes (photo, name, bio).
    this.userService.getUserProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (profile: UserProfile) => {
        this.userName = profile.name || 'User';
        this.photoURL = this.config.uploadUrl(profile.profilePicture);
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
        // Display a non-critical error for the user
        this.snackBar.open('Failed to fetch profile updates.', 'Close', { duration: 3000 });
      }
    });
  }

  getUserInitial(): string {
		const name = this.userName?.trim();
		if (name && name.length > 0) {
			return name.charAt(0).toUpperCase();
		}
		return 'U'; // Default initial if name is empty
	}

  
  // goBackToDashboard(): void {
  //   this.router.navigate(['/dashboard']);
  // }
}


