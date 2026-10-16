import { Course } from './course.model'; // Assumes Course interface is defined here
import { Lesson } from './course.model'; // Assumes Lesson interface is defined here

export interface QuizAttemptSummary {
  quizAttemptId: number;
  quizId: number;
  courseTitle: string;
  score: number; // e.g., 85
  maxScore: number; // e.g., 100
  attemptDate: string; // ISO Date String
  isCompleted: boolean;
}


export interface DashboardNavItem {
  label: string;
  path: string;
  icon: string;
}



export interface UserProfile {
    userId: number;
    name: string;
    email: string;
    bio: string; // The user's biography
    profilePicture: string; // The filename/URL for the picture
    role: number; // UserRole enum value (Admin: 3, Student: 1, etc.)
    lastLogin: Date | null;
    updatedAt: Date | null;
    isActive: boolean;
    isDeleted: boolean;
}


export interface UpdateBioRequest {
    bio: string;
}


export interface EnrolledCourse {
  courseID: number;
  title: string;
  description: string;
  level?: string;
  language?: string;
  duration?: number;
  thumbnailURL?: string;
  enrollmentDate: string; // From UserEnrolledCourse.cs (for sorting)
  completionStatus?: string; // e.g., "In Progress", "Completed"
  
  // Assumed necessary fields for student display/filtering/sorting:
  categoryID: number; // For filtering (from CourseDto.cs)
  progress: number; // A number between 0 and 100 (Assumed field for UI)
  instructor: string; // Instructor Name (Assumed field for UI/Search)
  rating: number; // For sorting by "Highest Rated" (from CourseDto.cs)
  lessons: Lesson[];
}


export interface CourseAvgScore {
  courseTitle: string;
   courseName: string;
  averageScore: number; // The percentage score (0-100)
}




export interface DashboardSummary {
  enrolledCoursesCount: number;
  completedCoursesCount: number;
  uniqueQuizzesAttempted : number; // Average progress percentage across all courses
}

export interface TopInstructorDto {
    instructorID: number;
    name: string;
    profilePicture: string | null;
    overallRating: number | null;
    totalStudents: number;
}

// 🟢 NEW: Main Data Structure from the API
export interface StudentDashboardData {
    enrolledCoursesCount: number;
    completedCoursesCount: number;
    uniqueQuizzesAttempted: number;
    courseAverageScores: CourseAvgScore[];
    topInstructors: TopInstructorDto[]; // Array of the new instructor DTO
}




export interface SummaryCard {
  title: string;
  value: number | string; // Can be a number or formatted string
  iconName: string; // Name of the Material Icon (e.g., 'school')
  colorClass: string; // CSS class for background color (e.g., 'blue', 'green')
  trend: string; // Trend string (e.g., '+5%')
}

// Basic structure for chart data
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    tension?: number;
    fill?: boolean;
    pointBackgroundColor?: string;
  }[];
}


export interface QuizScoreSummary {
  scoreID: number;
  quizID: number;
  quizTitle: string;
  score: number; // The marks achieved in this attempt
  attemptNumber: number;
  totalMarks: number; // The maximum possible marks for the quiz
  createdAt: string; // ISO Date string of the attempt
}

export interface QuizSummary {
  srNo: number;
  quizID: number;
  quizTitle: string;
  totalMarks: number;
  highestScore: number | null;
  attemptsAllowed: number;
  attemptsLeft: number;
  // Added fields to support filtering by course
  courseID: number;
  courseTitle: string;
}

