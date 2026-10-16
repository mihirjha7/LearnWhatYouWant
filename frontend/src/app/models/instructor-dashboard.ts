export interface InstructorProfileApi {
    userId: number;
    name: string; 
    email: string;
    bio: string;
    profilePicture: string;
    role: number;
    lastLogin: Date | null;
    updatedAt: Date | null;
    isActive: boolean;
    isDeleted: boolean;
}

// Interface for the Top Courses table
export interface Course {
  name: string;
  instructor: string;
  lessons: number;
  totalTime: string;
  status: 'Published' | 'Draft' | 'Upcoming' | 'Push';
}

export interface RawDashboardData {
    instructorName: string;
    totalStudents: number;
    totalCourses: number;
    totalVideos: number;
    // Keeping the earning mock here as it's still a data point from the 'backend' (mocked)
    totalEarning: string; 
}