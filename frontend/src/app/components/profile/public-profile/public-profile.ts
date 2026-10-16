// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatSnackBar } from '@angular/material/snack-bar'; 
// import { MatSpinner } from '@angular/material/progress-spinner';
// import { MatIconModule } from '@angular/material/icon'; 

// import { UserService } from '../../../services/user-service'
// import { UserProfile } from '../../../models/interfaces';


// @Component({
//   selector: 'app-public-profile',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     MatCardModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatButtonModule,
//     MatSpinner,
//     MatIconModule
//   ],
//   templateUrl: './public-profile.html',
//   styleUrls: ['./public-profile.css']
// })
// export class PublicProfileComponent implements OnInit {
//   // Use a temporary copy to avoid modifying the service's state directly during form fill
//   userProfile: UserProfile = { name: '', bio: '', email: '', profilePicture: null };
//   isLoading = true;
//   isSaving = false; // Added flag for save button spinner

//   private userService = inject(UserService);
//   private snackBar = inject(MatSnackBar);

//   ngOnInit(): void {
//     // Fetch profile data once to populate the form
//     this.userService.getUserProfile().subscribe({
//       next: (profile) => {
//         // Deep copy the received profile to userProfile for form editing
//         this.userProfile = { ...profile }; 
//         this.isLoading = false;
//       },
//       error: (err) => {
//         console.error('Error fetching profile:', err);
//         this.snackBar.open('Failed to load profile.', 'Close', { duration: 3000 });
//         this.isLoading = false;
//       }
//     });
//   }

//   saveProfile(): void {
//     this.isSaving = true; // Start spinner on the save button
    
//     // Create a DTO with only the fields we are updating (name, bio)
//     const updateDto = {
//         name: this.userProfile.name,
//         bio: this.userProfile.bio
//     };

//     // Assuming the service updates the backend AND updates the shared user state
//     this.userService.updateUserProfile(updateDto as UserProfile).subscribe({ 
//       next: (updatedProfile) => {
//         // FIX 1: Explicitly update local state with returned profile. 
//         // Using spread here is key to refreshing the ngModel bindings correctly.
//         this.userProfile = { ...updatedProfile }; 
//         this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
//         this.isSaving = false;
//       },
//       error: (err) => {
//         console.error('Error saving profile:', err);
//         this.snackBar.open('Failed to save profile.', 'Close', { duration: 3000 });
//         this.isSaving = false;
//       }
//     });
//   }
// }


import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon'; 
// Import RxJS operators needed for API chaining
import { switchMap, tap, finalize } from 'rxjs/operators';
import { of } from 'rxjs'; 

import { UserService } from '../../../services/user-service'
import { UserProfile } from '../../../models/interfaces';


@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSpinner,
    MatIconModule
  ],
  templateUrl: './public-profile.html',
  styleUrls: ['./public-profile.css']
})
export class PublicProfileComponent implements OnInit {
  // Use a temporary copy to avoid modifying the service's state directly during form fill
  userProfile: UserProfile = { name: '', bio: '', email: '', profilePicture: null };
  isLoading = true;
  isSaving = false; // Added flag for save button spinner

  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    // Fetch profile data once to populate the form
    this.fetchProfile();
  }
  
  // Helper function to fetch the profile and handle state
  fetchProfile(): void {
    // We only set isLoading to true if we are not currently saving (to avoid spinner conflicts)
    if (!this.isSaving) {
      this.isLoading = true;
    }
    
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        // Deep copy the received profile to userProfile for form editing
        // This ensures the form is bound to the latest data
        this.userProfile = { ...profile }; 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.snackBar.open('Failed to load profile.', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }


  saveProfile(): void {
    this.isSaving = true; // Start spinner on the save button
    
    // Create a DTO with only the fields we are updating (name, bio)
    const updateDto = {
        name: this.userProfile.name,
        bio: this.userProfile.bio
    };

    // 1. Call the update API
    this.userService.updateUserProfile(updateDto as UserProfile).pipe(
      // The update API returns a success response (likely status/message) which we ignore here.
      // 2. Use switchMap to immediately call the fetch profile API upon successful update.
      switchMap(() => {
        // If the update was successful, request the new, verified profile data
        return this.userService.getUserProfile();
      }),
      // 3. Use finalize to stop the saving spinner regardless of success or error
      finalize(() => {
        this.isSaving = false;
      })
    ).subscribe({ 
      next: (fullUpdatedProfile) => {
        // 4. Update the local state with the guaranteed fresh data from the second API call
        this.userProfile = { ...fullUpdatedProfile }; 
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error saving profile:', err);
        this.snackBar.open('Failed to save profile. Please try again.', 'Close', { duration: 3000 });
        // NOTE: If an error occurs, the local userProfile state remains unchanged (with the user's attempted edits)
      }
    });
  }
}
