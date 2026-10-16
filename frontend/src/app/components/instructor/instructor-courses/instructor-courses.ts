import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http'; 
import { CourseService } from '../../../services/instructor-course-service'; 
import { Router} from '@angular/router';
import { DurationFormatPipe } from '../../shared/pipes/duration-format-pipe';
import { Lesson, LessonFormState } from '../../../models/course.model';
import { FormsModule, NgModel } from '@angular/forms';
import { CourseInstructorService } from '../../../services/course-creation-service';
// Define the structure for a course object (component's expected data format)
export interface Course {
  courseID: number;
  name: string;
  instructor: string;
  lessons: number;
  totalTime: number;
  status: 'Published' | 'Upcoming' | 'Unlisted';
  category: string;
}

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    HttpClientModule,
    DurationFormatPipe,
    FormsModule,
  ],
  templateUrl: './instructor-courses.html',
  styleUrls: ['./instructor-courses.css']
})
export class InstructorCoursesComponent implements OnInit {

  courseList: Course[] = []; 
  isLoading: boolean = true; 

  lesson: LessonFormState = {
    courseID: null,
    title: '',
    content: '',
    lessonType: 'Video',
    estimatedTime: null,
    orderIndex: 0,
    videoURL: '',
    includeDocument: false,
    attachmentFile: null, // Client-side file object
    lessonAttachmentUrl: null,     // Replaced attachmentURL
    lessonAttachmentFileName: null, // Added file name field
  };


  constructor(private courseService: CourseService, private courseInstructorService: CourseInstructorService, private router: Router) { }


  selectedCourse: any = null;

toggleLessonForm(course: any) {
  console.log('Toggling lesson form for course:', course);
  this.selectedCourse = this.selectedCourse?.id === course.courseID ? null : course;
  console.log('Selected Course:', this.selectedCourse);
  this.lesson.courseID = course.courseID;
}

closeLessonForm(course: any) {
  console.log('Closing lesson form for course:', course);
  this.selectedCourse = null;
}


onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.lesson.attachmentFile = file;
    this.lesson.lessonAttachmentFileName = file.name;
  }
}


submitLesson() {
  // Handle lesson submission logic here
  const metadataPayload: Omit<Lesson, 'lessonID' | 'lessonAttachmentUrl' | 'lessonAttachmentFileName'> = {
        courseID: this.selectedCourse?.courseID!,
        title: this.lesson.title,
        content: this.lesson.content,
        videoURL: this.lesson.videoURL,
        orderIndex: this.lesson.orderIndex,
        lessonType: this.lesson.lessonType,
        estimatedTime: this.lesson.estimatedTime!,
    } as Omit<Lesson, 'lessonID' | 'lessonAttachmentUrl' | 'lessonAttachmentFileName'>;
  console.log('Lesson submitted:', this.lesson);
  this.courseInstructorService.createLesson(metadataPayload).subscribe({
    next: (response) => {
      console.log('Lesson created successfully:', response);
    },
    error: (error) => {
      console.error('Error creating lesson:', error);
    }
  });
  this.selectedCourse = null; // Close the form
}



  ngOnInit(): void {
    this.fetchCourses();
    console.log(this.courseList)
  }
  
  fetchCourses(): void {
    this.isLoading = true;
    this.courseService.getInstructorCourses().subscribe({
      next: (data) => {
        this.courseList = data;
        console.log('Fetched Courses:', data);
        this.isLoading = false;
        console.log('Courses fetched successfully from API.');
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: Course['status']): string {
    switch (status) {
      case 'Published':
        return 'status-published';
      case 'Upcoming':
        return 'status-upcoming';
      case 'Unlisted':
      default:
        return 'status-push';
    }
  }
  
  trackByCourseName(index: number, course: Course): string {
    return course.name; 
  }
  
  viewCourse(course: Course): void { 
    this.router.navigate(['/instructor/course', course.name]);
   }
  editCourse(course: Course): void { 
  }
  createQuiz(course: Course): void {
    this.router.navigate([`/instructor/quiz-builder/${course.courseID}`]);
  }
  createCourse(): void {
    this.router.navigate(['/instructor/createcourse']);
  }

}