import { Course } from "./course.model";

// src/app/models/interfaces.ts
export interface User {
  userId: number;
  name: string;
  email: string;
  bio: string | null;
  profilePicture: string | null;
  lastLogin: string;
  role: number; // 1 = Student, 2 = Instructor, 3 = Admin
  updatedAt: string;
  isActive: boolean;
  isDeleted: boolean;
}



export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  roles: {
    [key: string]: number; // e.g., { Admin: 5, Instructor: 10 }
  };
}




export interface Category {
  categoryID: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string | null;
  isDeleted: boolean;
  courses: Course[] | null;
}

export interface UserProfile {
  name : string;
  email: string;
  bio: string;
  profilePicture: string | null; 
}

export interface UserPhoto {
  photoURL: string | null;
}
