// photo-profile.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar'; // For upload progress
import { MatSpinner } from '@angular/material/progress-spinner';

import { UserService } from '../../../services/user-service'
import { UserProfile, UserPhoto } from '../../../models/interfaces'; // Assuming UserPhoto is { photoURL: string | null }




@Component({
  selector: 'app-photo-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSpinner
  ],
  templateUrl: './photo-profile.html',
  styleUrls: ['./photo-profile.css']
})
export class PhotoProfileComponent implements OnInit {
  userPhoto: UserPhoto = { photoURL: null };
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  isLoading = true;
  isUploading = false;

  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.userService.getUserPhoto().subscribe({
      next: (photo) => {
        this.userPhoto.photoURL = photo.photoURL;
        this.imagePreviewUrl = photo.photoURL; // Set the existing URL for preview
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching photo:', err);
        this.snackBar.open('Failed to load profile photo.', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.userPhoto.photoURL = null;
        this.imagePreviewUrl = null;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = e => {
        this.imagePreviewUrl = e.target?.result as string | ArrayBuffer;
      };
      reader.readAsDataURL(this.selectedFile);

    } else {
      this.selectedFile = null;
      this.imagePreviewUrl = this.userPhoto.photoURL; 
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Please select an image to upload.', 'Close', { duration: 3000 });
      return;
    }

    this.isUploading = true;
    this.userService.uploadUserPhoto(this.selectedFile).subscribe({
      next: (photoURL) => {
        this.userPhoto.photoURL = photoURL;
        this.imagePreviewUrl = photoURL;
        this.selectedFile = null; 
        this.snackBar.open('Profile photo uploaded successfully!', 'Close', { duration: 3000 });
        this.isUploading = false;
      },
      error: (err) => {
        console.error('Error uploading photo:', err);
        this.snackBar.open('Failed to upload profile photo.', 'Close', { duration: 3000 });
        this.isUploading = false;
      }
    });
  }

  removeImage(): void {
    if (!this.userPhoto.photoURL && !this.selectedFile) {
      this.snackBar.open('No image to remove.', 'Close', { duration: 3000 });
      return;
    }

    this.userService.deleteUserPhoto().subscribe({
      next: () => {
        this.userPhoto.photoURL = null;
        this.imagePreviewUrl = null;
        this.selectedFile = null;
        this.snackBar.open('Profile photo removed successfully!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error removing photo:', err);
        this.snackBar.open('Failed to remove profile photo.', 'Close', { duration: 3000 });
      }
    });
  }
}








