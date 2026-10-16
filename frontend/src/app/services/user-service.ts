// src/app/services/user-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs'; 

import { UserProfile } from '../models/interfaces'; 
import { RuntimeConfigService } from '../core/config/runtime-config';

// Define the API response structure for the photo, 
export interface UserPhotoResponse { 
  photoURL: string | null; // Renamed for consistency with component usage
}

// Interface for the PUT request body to update the main profile data
export interface UpdateProfileRequest {
  name: string;
  bio: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private config = inject(RuntimeConfigService);
  private apiUrl = this.config.apiBaseUrl;
  private userManagementBaseUrl = `${this.apiUrl}/UserManagement/me`; 

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.userManagementBaseUrl);
  }


  updateUserProfile(profile: UserProfile): Observable<UserProfile> {
    const updateRequest: UpdateProfileRequest = {
      name: profile.name,
      bio: profile.bio
    };
    return this.http.put<UserProfile>(`${this.userManagementBaseUrl}/bio`, updateRequest);
  }



  getUserPhoto(): Observable<UserPhotoResponse> {
    return this.http.get<UserProfile>(this.userManagementBaseUrl).pipe(
      map(profile => ({
        photoURL: this.config.uploadUrl(profile.profilePicture),
      }))
    );
  }

 
  uploadUserPhoto(file: File): Observable<string> {
    const formData = new FormData();
    // 'file' must match the parameter name (IFormFile file) in the backend controller.
    formData.append('file', file, file.name);

    return this.http.post<{ FileName: string; Message: string }>(
      `${this.userManagementBaseUrl}/profilePicture`,
      formData
    ).pipe(
      // Maps the backend response object to return only the file name/path string
      map(res => this.config.uploadUrl(res.FileName) ?? res.FileName)
    );
  }


  deleteUserPhoto(): Observable<any> {
    return this.http.delete(`${this.userManagementBaseUrl}/profilePicture`);
  }
}


