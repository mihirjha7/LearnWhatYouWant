import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 Essential for data binding
import { RouterModule } from '@angular/router'; // 👈 Essential for navigation
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, forkJoin, throwError,map } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import {
  CourseInstructorService,
} from '../../../services/course-creation-service';
import {
  Lesson, // Base DTO/Service type
  CourseCategory,
  CourseFormState, // Replaces local CourseData
  LessonFormState, // Replaces local Lesson
  CreateCourseDto
} from '../../../models/course.model';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// --- LOCAL INTERFACES (AUGMENTED from Service) ---

// Extend Service's CourseCategory for local state management
// interface Category extends CourseCategory { }

// Local CourseData must hold all fields needed across the flow
// interface CourseData {
//   id: number | null;
//   instructorId: number | null;
//   title: string;
//   description: string;
//   syllabus: string; // Assuming this is part of the detail update in Step 2
//   thumbnailURL: string; // Assuming this is part of the detail update in Step 2
//   level: 'Beginner' | 'Intermediate' | 'Expert' | string; // Assuming this is part of the detail update in Step 2
//   language: string; // Assuming this is part of the detail update in Step 2
//   duration: number | null; // Total duration based on lessons (calculated) or initial estimate
//   categoryId: number | null;
//   categoryName: string | null;
//   categoryDescription: string | null;
//   status: 'Draft' | 'Published';
// }

// // Local Lesson interface, augmented for UI/upload features
// interface Lesson {
//   id?: number | null;
//   courseId: number | null;
//   title: string;
//   content: string; // Detailed content (not in service, assumed local/extended detail)
//   lessonType: 'Video';
//   estimatedTime: number | null;
//   orderIndex: number; // For UI sorting
//   videoURL: string; // Assumed part of the lesson detail
//   includeDocument: boolean;
//   lessonAttachmentUrl: string | null; // URL after successful upload
//   attachmentFile?: File | null; // Client-side file object for upload
// }

// --- MAIN COMPONENT ---

@Component({
  selector: 'app-instructor-createcourse',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    // Angular Material:
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './instructor-createcourse.html',
  styleUrls: ['./instructor-createcourse-layout.css', './instructor-createcourse.css'],

})
export class InstructorCreateCourseComponent implements OnInit {
  // --- Services and Dependencies ---
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private courseService: CourseInstructorService // Injected Service
  ) { }
  activeStep: 'category' | 'details' | 'lessons' | 'preview' = 'category';
  completedSteps: {
    category: boolean,
    details: boolean,
    lessons: boolean,
    // Note: 'preview' is usually not here as it's the final action step
  } = {
      category: false,
      details: false,
      lessons: false,
    };
  isLoading: boolean = true;
  courseId: number | null = null;
  instructorId: number | null = null;

  allCategories: CourseCategory[] = [];
  categorySearchText: string = '';
  filteredCategories: CourseCategory[] = [];
  selectedCategory: CourseCategory | null = null;
  categoryStatus: 'none' | 'existing' | 'new' = 'none';
  newCategoryDescription: string = '';

  courseData: CourseFormState = {
    courseID: null,
    instructorId: null,
    title: '',
    description: '',
    syllabus: '',
    thumbnailURL: '',
    level: 'Beginner',
    language: 'English',
    duration: 10,
    categoryID: null,
    courseMaterialFile: null, // The file object for client-side upload
    categoryName: null,
    categoryDescription: null,
    status: 'Draft',
  };

  lessons: LessonFormState[] = [];
  // Initialize lessonData using the template to set defaults
  lessonData: LessonFormState = this.getNewLessonTemplate();
  lessonToEditIndex: number | null = null;
  expandedLessonId: number | null | undefined = null;

  ngOnInit(): void {
    this.courseService.getCurrentInstructorId().pipe(
      tap(instructorId => {
        this.instructorId = instructorId; // Set the ID immediately
        this.courseData.instructorId = instructorId;
        if (!instructorId) {
          // if the API returns 0 or null, we stop.
          console.error("CRITICAL: Instructor ID could not be loaded from the service.");
          this.isLoading = false;
          return;
        }
      }),
      switchMap(instructorId => forkJoin({
        categories: this.courseService.getAllCategories(),
        courseIdFromRoute: this.route.paramMap.pipe(
          // Use distinctUntilChanged if you are worried about multiple param emissions
          tap(params => {
            const id = params.get('courseId');
            this.courseId = id ? +id : null;
          }),
          switchMap(() => of(this.courseId))
        )
      })),
      tap(({ categories }) => {
        this.allCategories = categories;
        this.filteredCategories = categories;
      }),
      switchMap(({ courseIdFromRoute }) => {
        if (courseIdFromRoute) {
          return forkJoin({
            lessons: this.courseService.getLessonsByCourse(courseIdFromRoute),
            
            courseDetails: of({
              title: "Loaded Title", description: "Loaded Description", categoryId: 1,
              categoryName: "Web Development", categoryDescription: "Learn to build...", status: 'Draft'
            } as Partial<CourseFormState>)
          });
        }
        return of({ lessons: [], courseDetails: null });
      }),
      // 4. Update component state with loaded course data and lessons
      tap(({ lessons, courseDetails }) => {
        if (courseDetails) {
          this.updateStateFromCourseData(courseDetails as CourseFormState);
        }

        // Map service lessons to local augmented Lesson interface
        this.lessons = lessons.map(l => ({
          lessonID: (l.lessonID === undefined ? null : l.lessonID) as number | null,
          courseID: this.courseId,
          title: l.title,
          orderIndex: l.orderIndex,
          estimatedTime: l.estimatedTime,
          content: 'Loaded content...', // Placeholder for content fetching
          lessonType: 'Video',
          videoURL: 'https://video.link/loaded', // Placeholder for video fetching
          includeDocument: false, // Placeholder for attachment state
          lessonAttachmentUrl: null // Placeholder for attachment URL
        }));

        this.completedSteps.lessons = this.lessons.length > 0;
        this.setActiveStepInitial();
        this.isLoading = false;
      }),
      catchError(err => {
        console.error('Failed to load initial course data:', err);
        this.isLoading = false;
        return of(null);
      })
    ).subscribe();
  }

  private updateStateFromCourseData(course: CourseFormState) {
    // Merge the loaded course details into the local state
    this.courseData = { ...this.courseData, ...course, courseID: course.courseID || this.courseId, instructorId: this.instructorId, courseMaterialUrl: course.courseMaterialUrl || null, };

    if (course.categoryID && course.categoryName) {
      this.completedSteps.category = true;
      this.selectedCategory = this.allCategories.find(c => c.categoryID === course.categoryID) || { categoryID: course.categoryID, name: course.categoryName!, description: course.categoryDescription || '' };
      this.categorySearchText = course.categoryName;
      this.categoryStatus = 'existing';
    }

    if (course.title && course.description) {
      this.completedSteps.details = true;
    }
  }

  private setActiveStepInitial() {
    if (!this.completedSteps.category) {
      this.activeStep = 'category';
    } else if (!this.completedSteps.details) {
      this.activeStep = 'details';
    } else if (!this.completedSteps.lessons) {
      this.activeStep = 'lessons';
    } else {
      this.activeStep = 'preview';
    }
  }


  private getNewLessonTemplate(): LessonFormState {
    return {
      lessonID: null, 
      courseID: this.courseId, 
      title: '',
      content: '',
      lessonType: 'Video',
      estimatedTime: 10,
      orderIndex: this.lessons.length + 1,
      videoURL: '',
      includeDocument: false,
      lessonAttachmentUrl: null,
      attachmentFile: null,
    } as LessonFormState;
  }

  private resetLessonForm(): void {
    this.lessonToEditIndex = null;
    this.lessonData = this.getNewLessonTemplate();
    this.lessonData.orderIndex = this.lessons.length + 1; // Correct order index for the next new lesson
    this.expandedLessonId = null; // Collapse any expanded lesson on form reset
    console.log('Lesson form reset to Add New Lesson mode.');
  }

  onCategorySearch() {
    this.selectedCategory = null;
    this.categoryStatus = 'none';

    if (!this.categorySearchText.trim()) {
      this.filteredCategories = this.allCategories;
      return;
    }

    const searchTextLower = this.categorySearchText.trim().toLowerCase();
    const match = this.allCategories.find(cat => cat.name.toLowerCase() === searchTextLower);

    if (match) {
      this.selectCategory(match);
      this.filteredCategories = [];
    } else {
      this.categoryStatus = 'new';
      this.filteredCategories = this.allCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchTextLower)
      );
    }
  }

  selectCategory(cat: CourseCategory) {
    this.selectedCategory = cat;
    this.categorySearchText = cat.name; // Keep the search text synchronized
    this.categoryStatus = 'existing'; // Mark status as existing
    // Ensure the course data is populated immediately for validation/display
    this.courseData.categoryID = cat.categoryID;
    this.courseData.categoryName = cat.name;
    this.courseData.categoryDescription = cat.description;
  }

  isCategoryStepValid(): boolean {
    if (this.categoryStatus === 'existing' && this.selectedCategory && this.selectedCategory.categoryID > 0) {
      return true;
    }

    if (this.categoryStatus === 'new' && this.categorySearchText.trim().length > 0 && this.newCategoryDescription.trim().length >= 10) {
      return true;
    }

    return false;
  }
  saveCategoryStep(next: boolean = false) {
    if (!this.isCategoryStepValid() || !this.instructorId) {
      console.warn('Validation failed or Instructor ID is missing.');
      return;
    }

    this.isLoading = true;

    let category$: Observable<CourseCategory>;

    // 1. Determine Category Action (Create New or Use Existing)
    if (this.categoryStatus === 'new') {
      const newCatDetails = { name: this.categorySearchText.trim(), description: this.newCategoryDescription.trim(), categoryID: 0 };
      category$ = this.courseService.createCategory(newCatDetails).pipe(
        tap(newCategory => this.allCategories.push(newCategory))
      );
    } else {
      category$ = of(this.selectedCategory!);
    }

    category$.subscribe({
      next: (cat) => {
        const categoryIdFromApi = cat.categoryID; 

        // 1. Check if the ID is valid
        if (typeof categoryIdFromApi !== 'number' || categoryIdFromApi <= 0) {
          console.error('API failed to return a valid Category ID (categoryID <= 0).', cat);
          this.isLoading = false;
          return;
        }

        // 2. Update the local state with the valid ID
        this.courseData.categoryID = categoryIdFromApi;
        this.courseData.categoryName = cat.name;
        this.courseData.categoryDescription = cat.description;

        this.completedSteps.category = true;
        console.log('Category saved/selected successfully. ID:', categoryIdFromApi);

        this.isLoading = false;


      },
      error: (err) => {
        console.error('API Error: Category save failed', err);
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.courseData.courseMaterialFile = file;
      console.log('Course material file selected:', file.name);
    }
  }
  isCourseDetailsValid(): boolean {
    const data = this.courseData;

    const isTitleValid: boolean = !!(data.title && data.title.trim().length >= 5);
    const isDescriptionValid: boolean = !!(data.description && data.description.trim().length >= 10);
    const isSyllabusValid: boolean = !!(data.syllabus && data.syllabus.trim().length >= 10);

    const isLevelValid: boolean = !!data.level;
    const isLanguageValid: boolean = !!(data.language && data.language.trim().length >= 2);
    const isMaterialValid: boolean = !this.courseData.courseMaterialFile || !!this.courseData.courseMaterialFile;

    const isDurationValid: boolean = typeof data.duration === 'number' && data.duration > 0;

    return (
      isTitleValid &&
      isDescriptionValid &&
      isSyllabusValid &&
      isLevelValid &&
      isLanguageValid &&
      isDurationValid &&
      isMaterialValid
    );
  }

  onCourseMaterialFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.courseData.courseMaterialFile = file;
      this.courseData.courseMaterialUrl = `/temp-upload/${file.name}`;
    } else {
      this.courseData.courseMaterialFile = null;
      this.courseData.courseMaterialUrl = null;
    }
  }

  saveDetailsStep(next: boolean = false) {
    this.isLoading = true;

    // 1. Validation Check (Details fields must be valid)
    if (!this.isCourseDetailsValid()) {
      console.warn('Validation failed: Course Details are incomplete or invalid.');
      this.isLoading = false;
      return;
    }

    if (!this.courseData.categoryID) {
      console.error('Cannot create course: Category ID is required but missing.');
      this.isLoading = false;
      return;
    }

    const createPayload: CreateCourseDto = {
      title: this.courseData.title,
      description: this.courseData.description,
      syllabus: this.courseData.syllabus,
      level: this.courseData.level,
      language: this.courseData.language,
      thumbnailURL: this.courseData.thumbnailURL,
      duration: this.courseData.duration,
      categoryID: this.courseData.categoryID,
      published: false
    };

    // 3. Execute Course Creation and Chain File Upload
    this.courseService.createCourse(createPayload).pipe(
      tap((newCourse) => {
        const courseIdFromApi = (newCourse as any).courseID || (newCourse as any).CourseID || (newCourse as any).ID;

        if (typeof courseIdFromApi !== 'number' || courseIdFromApi <= 0) {
          // Throw error to be caught by the final 'catchError'
          throw new Error('API returned success but failed to provide a valid Course ID.');
        }

        this.courseId = courseIdFromApi;
        this.courseData = { ...this.courseData, ...newCourse };
        console.log('New Course created successfully with ID:', this.courseId);
      }),

      switchMap(() => {
        // Check if a file object exists in our local state
        if (this.courseId && this.courseData.courseMaterialFile) {
          console.log(`➡️ Starting course material upload for Course ID: ${this.courseId}`);
          // Call the new service method you created
          return this.courseService.uploadCourseMaterial(this.courseId, this.courseData.courseMaterialFile);
        }
        // If no file, return an observable that completes immediately, allowing execution to continue
        return of(void 0);
      }),

      tap((uploadResponse) => {
        if (uploadResponse) {
          // Update the local data with the URL/Name returned from the API
          this.courseData.courseMaterialUrl = uploadResponse.Url;
          this.courseData.courseMaterialFile = null; // Clear temporary file reference
          console.log('Course material URL updated in database.');
        }
      }),

      // --- Step D: Centralized Error Handling ---
      catchError(err => {
        // Handle and re-throw an error from either creation or upload step
        console.error('An error occurred during course save or material upload:', err);
        return throwError(() => new Error('Course creation/upload failed.'));
      })

    ).subscribe({
      next: () => {
        // SUCCESS: Both course creation and file upload (if any) completed
        this.completedSteps.details = true;
        this.isLoading = false;

        if (next) {
          this.setActiveStep('lessons');
        }
      },
      error: (err) => {
        // Error will be from the catchError re-throw
        console.error(err.message);
        this.isLoading = false;
      }
    });
  }


  get isLessonFormValid(): boolean {
    const isBaseValid = this.lessonData.title.trim().length >= 3 &&
      this.lessonData.estimatedTime !== null &&
      this.lessonData.estimatedTime! > 0 &&
      !!this.lessonData.videoURL; // Require video for simplicity

    const isAttachmentValid = !this.lessonData.includeDocument || !!this.lessonData.attachmentFile;

    return isBaseValid && isAttachmentValid;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.lessonData.attachmentFile = file;
      this.lessonData.lessonAttachmentUrl = `/temp-upload/${file.name}`; // Temporary client URL
    } else {
      this.lessonData.attachmentFile = null;
      this.lessonData.lessonAttachmentUrl = null;
    }
  }


saveLesson() {
    if (!this.courseId || !this.isLessonFormValid) {
        console.warn('Cannot save lesson. Course ID missing or form is invalid.');
        return;
    }

    this.isLoading = true;

    // A. Prepare the Lesson Payload (Metadata only, for create/update API)
    // NOTE: We omit lessonAttachmentUrl/FileName from this payload as the dedicated upload API handles it.
    const metadataPayload: Omit<Lesson, 'lessonID' | 'lessonAttachmentUrl' | 'lessonAttachmentFileName'> = {
        courseID: this.courseId!,
        title: this.lessonData.title,
        content: this.lessonData.content,
        videoURL: this.lessonData.videoURL,
        orderIndex: this.lessonData.orderIndex,
        lessonType: this.lessonData.lessonType,
        estimatedTime: this.lessonData.estimatedTime!,
    } as Omit<Lesson, 'lessonID' | 'lessonAttachmentUrl' | 'lessonAttachmentFileName'>;

    let finalAction$: Observable<Lesson>; // The final Observable chain to subscribe to
    const fileSelected = this.lessonData.includeDocument && this.lessonData.attachmentFile;


    // =========================================================================
    // SCENARIO 1: UPDATING an existing lesson (lessonID is present)
    // =========================================================================
    if (this.lessonData.lessonID) {
        const lessonId = this.lessonData.lessonID;
        
        // Full Lesson object for the standard PUT/Update endpoint
        const fullLessonToUpdate: Lesson = { 
            ...(metadataPayload as unknown as Lesson),
            lessonID: lessonId,
            // Include existing URL/FileName for metadata-only updates
            lessonAttachmentUrl: this.lessonData.lessonAttachmentUrl, 
            lessonAttachmentFileName: this.lessonData.lessonAttachmentFileName,
        };

        if (fileSelected) {
            // Case 1A: Existing Lesson, New File -> Upload first, then update metadata (if needed)
            finalAction$ = this.courseService.uploadLessonAttachment(
                lessonId, 
                this.lessonData.attachmentFile!
            ).pipe(
                // After successful upload, the file URL/Name is saved in the backend.
                // We still need to call updateLesson to save title, content, etc.
                switchMap(fileResponse => {
                    // Update local state with the actual URL/FileName from the server response
                    this.lessonData.lessonAttachmentUrl = fileResponse.url;
                    this.lessonData.lessonAttachmentFileName = fileResponse.fileName;

                    // Update the full object for the subsequent metadata update call
                    fullLessonToUpdate.lessonAttachmentUrl = fileResponse.url;
                    fullLessonToUpdate.lessonAttachmentFileName = fileResponse.fileName;

                    // Call the standard metadata update API
                    return this.courseService.updateLesson(fullLessonToUpdate);
                })
            );

        } else {
            // Case 1B: Existing Lesson, No New File -> Only update metadata (PUT /api/Lesson/{id})
            finalAction$ = this.courseService.updateLesson(fullLessonToUpdate);
        }
    } 
    // =========================================================================
    // SCENARIO 2: CREATING a new lesson (lessonID is missing)
    // =========================================================================
    else {
        // Step 1: Create the lesson first (without attachment URL)
        const createAction$ = this.courseService.createLesson(metadataPayload);

        if (fileSelected) {
            // Case 2A: New Lesson, File Selected -> Create -> Upload Attachment
            finalAction$ = createAction$.pipe(
                // Get the lessonID from the creation response
                switchMap(createdLesson => {
                    this.lessonData.lessonID = createdLesson.lessonID; // Update local state with new ID
                    
                    // Now use the new ID to call the dedicated upload API
                    return this.courseService.uploadLessonAttachment(
                        createdLesson.lessonID, 
                        this.lessonData.attachmentFile!
                    ).pipe(
                        // Map the result back to the created lesson object format
                        map(fileResponse => {
                            // Synchronize URL and FileName from the upload response to the final object
                            createdLesson.lessonAttachmentUrl = fileResponse.url;
                            createdLesson.lessonAttachmentFileName = fileResponse.fileName;
                            return createdLesson; // Pass the fully updated lesson object forward
                        })
                    );
                })
            );
        } else {
            // Case 2B: New Lesson, No File -> Only the create action
            finalAction$ = createAction$;
        }
    }


    // --- 3. Centralized Subscription (using the finalAction$ chain) ---
    finalAction$.pipe(
        // Centralized Error Handling
        catchError((err) => {
            console.error('API Error: Lesson save failed (including file upload)', err);
            this.isLoading = false;
            return throwError(() => new Error('Failed to save lesson or upload file. Please check server logs.'));
        })
    ).subscribe({
        next: (savedServiceLesson: Lesson) => {
            // --- SUCCESS HANDLER: Update the local array and UI state ---

            // Map saved service lesson back to local LessonFormState interface
            const savedLesson: LessonFormState = {
                ...this.lessonData,
                lessonID: savedServiceLesson.lessonID,
                orderIndex: savedServiceLesson.orderIndex,
                estimatedTime: savedServiceLesson.estimatedTime,
                courseID: savedServiceLesson.courseID,
                // Ensure attachment URL/FileName are synchronized from the final response
                lessonAttachmentUrl: savedServiceLesson.lessonAttachmentUrl || null,
                lessonAttachmentFileName: savedServiceLesson.lessonAttachmentFileName || null
            };
            console.log('✅ API CHECK: Saved Lesson ID:', savedLesson.lessonID);

            const index = this.lessons.findIndex(l => l.lessonID === savedLesson.lessonID);

            if (index !== -1) {
                this.lessons[index] = savedLesson;
                console.log('Lesson updated successfully:', savedLesson.title);
            } else {
                this.lessons.push(savedLesson);
                console.log('New Lesson created successfully:', savedLesson.title);
            }

            this.resetLessonForm();
            this.completedSteps.lessons = this.lessons.length > 0;
            this.lessons.forEach((l, i) => l.orderIndex = i + 1); 
            this.isLoading = false;
        },
        error: (err) => {
            console.error(err.message);
            this.isLoading = false;
        }
    });
}

  editLesson(lesson: LessonFormState, index: number) {
    this.lessonToEditIndex = index;
    this.lessonData = { ...lesson };
    // Collapse all other lessons when editing one
    this.expandedLessonId = null;
  }

  cancelEdit(): void {
    this.resetLessonForm();
  }

  private finalizeRemove(index: number) {
    this.lessons.splice(index, 1); // Remove from the local array
    this.lessons.forEach((l, i) => l.orderIndex = i + 1); // Re-index all lessons
    this.completedSteps.lessons = this.lessons.length > 0;
    this.expandedLessonId = null; 
    this.isLoading = false;
    console.log('Lesson deleted/removed successfully.');
  }

  /**
   * Handles the removal of a lesson.
   * - If lesson has an ID, it calls the API to delete from the database.
   * - If lesson has no ID (unsaved), it removes it only from the local list.
   */
  removeLesson(index: number) {
    const lesson = this.lessons[index];
    // This 'lessonId' is now correctly populated for saved lessons
    const lessonId = lesson.lessonID;

    if (!confirm(`Are you sure you want to remove lesson: ${lesson.title}?`)) {
      return; // User canceled
    }

    if (lessonId) {
      this.courseService.deleteLesson(lessonId).subscribe({ // <-- DELETES FROM DATABASE
        next: () => {
          this.lessons.splice(index, 1);
          this.lessons.forEach((l, i) => l.orderIndex = i + 1);
          this.completedSteps.lessons = this.lessons.length > 0;
          this.expandedLessonId = null;
          console.log(`✅ Lesson ID ${lessonId} deleted from database and front-end.`);
        },
        error: (err) => console.error('API Error: Lesson delete failed', err)
      });
    } else {
      this.lessons.splice(index, 1);
      this.lessons.forEach((l, i) => l.orderIndex = i + 1);
      this.completedSteps.lessons = this.lessons.length > 0;
      this.expandedLessonId = null;
      console.warn('⚠️ Lesson has no ID. Removing from local list only.');
    }
  }

  saveLessonsStep(next: boolean = false) {
    if (this.lessons.length === 0) {
      console.warn('You must add at least one lesson before proceeding.');
      return;
    }

    this.completedSteps.lessons = true;

    if (next) {
      this.setActiveStep('preview');
    } else {
      console.log('Lesson structure confirmed. Ready for Preview.');
    }
  }






  // =========================================================================
  //                             STEP 4: PUBLISH ACTIONS
  // =========================================================================

  saveAndFinish() {
    if (!this.courseId || this.lessons.length === 0) {
      console.warn('Cannot publish: Course ID missing or no lessons.');
      return;
    }

    this.courseService.updateCourseStatus(this.courseId, 'Published').subscribe({
      next: () => {
        this.courseData.status = 'Published';
        console.log('Course Published!');
        this.router.navigate(['/instructor/courses']);
      },
      error: (err) => console.error('API Error: Publish failed', err)
    });
  }

  setActiveStep(step: 'category' | 'details' | 'lessons' | 'preview') {
    if (step === 'details' && !this.completedSteps.category) return;
    if (step === 'lessons' && !this.completedSteps.details) return;
    if (step === 'preview' && !this.completedSteps.lessons) return;

    this.activeStep = step;
  }

  isFieldDisabled(step: 'category' | 'details'): boolean {
    return this.completedSteps[step] && this.activeStep !== step;
  }

  viewLessonDetails(lesson: LessonFormState) {
    this.expandedLessonId = this.expandedLessonId === lesson.lessonID ? null : lesson.lessonID;
  }
}