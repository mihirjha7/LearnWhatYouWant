import { Routes } from '@angular/router';
import { authGuard } from './services/auth-guard';
import { enrolledGuard } from './services/enrolled-guard';
import { publicGuard } from './services/public-guard';
import { quizEnrolledGuard } from './services/quiz-enrolled.guard';
import { featureFlagGuard } from './core/feature-flags/feature-flag.guard';

const policy = (path: string, mode: string, title: string) => ({
  path,
  title: `${title} | Learnova`,
  data: { mode },
  loadComponent: () =>
    import('./components/shared/policy-page/policy-page').then((component) => component.PolicyPageComponent),
});

const adminConsole = (path: string, mode: string, title: string) => ({
  path,
  title: `${title} | Learnova`,
  data: { mode },
  loadComponent: () =>
    import('./features/admin/admin-console').then((component) => component.AdminConsoleComponent),
});

const orgPage = (path: string, mode: string, title: string) => ({
  path,
  title: `${title} | Learnova`,
  data: { mode },
  loadComponent: () =>
    import('./features/organization/organization-workspace').then(
      (component) => component.OrganizationWorkspaceComponent,
    ),
});

export const routes: Routes = [
  {
    path: 'home',
    title: 'Home | Learnova',
    loadComponent: () =>
      import('./components/home/home').then((component) => component.HomeComponent),
  },
  {
    path: 'catalog',
    title: 'Course catalog | Learnova',
    loadComponent: () =>
      import('./features/catalog/catalog-page/catalog-page').then(
        (component) => component.CatalogPageComponent,
      ),
  },
  {
    path: 'search',
    title: 'Search | Learnova',
    loadComponent: () =>
      import('./features/catalog/catalog-page/catalog-page').then(
        (component) => component.CatalogPageComponent,
      ),
  },
  {
    path: 'catalog/courses/:courseId',
    title: 'Course details | Learnova',
    loadComponent: () =>
      import('./features/catalog/course-detail/catalog-course-detail').then(
        (component) => component.CatalogCourseDetailComponent,
      ),
  },
  {
    path: 'catalog/paths/:pathId',
    title: 'Learning path | Learnova',
    loadComponent: () =>
      import('./features/catalog/path-detail/path-detail').then(
        (component) => component.PathDetailComponent,
      ),
  },
  {
    path: 'login',
    title: 'Sign in | Learnova',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./components/auth/login/login').then((component) => component.LoginComponent),
  },
  {
    path: 'register',
    title: 'Create learner account | Learnova',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./components/auth/register/register').then((component) => component.Register),
  },
  {
    path: 'register-instructor',
    title: 'Teach with Learnova',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./components/auth/register-instructor/register-instructor').then(
        (component) => component.RegisterInstructor,
      ),
  },
  {
    path: 'forgot-password',
    title: 'Recover account | Learnova',
    data: { mode: 'forgot' },
    loadComponent: () => import('./components/auth/identity-flow/identity-flow').then((component) => component.IdentityFlowComponent),
  },
  {
    path: 'reset-password',
    title: 'Reset password | Learnova',
    data: { mode: 'reset' },
    loadComponent: () => import('./components/auth/identity-flow/identity-flow').then((component) => component.IdentityFlowComponent),
  },
  {
    path: 'verify-email',
    title: 'Verify email | Learnova',
    data: { mode: 'verify' },
    loadComponent: () => import('./components/auth/identity-flow/identity-flow').then((component) => component.IdentityFlowComponent),
  },
  {
    path: 'auth/mfa',
    title: 'Confirm identity | Learnova',
    data: { mode: 'mfa' },
    loadComponent: () => import('./components/auth/identity-flow/identity-flow').then((component) => component.IdentityFlowComponent),
  },
  {
    path: 'auth/session-expired',
    title: 'Session expired | Learnova',
    data: { mode: 'expired' },
    loadComponent: () => import('./components/auth/identity-flow/identity-flow').then((component) => component.IdentityFlowComponent),
  },
  {
    path: 'auth/callback',
    title: 'Completing sign in | Learnova',
    data: { mode: 'callback' },
    loadComponent: () => import('./components/auth/identity-flow/identity-flow').then((component) => component.IdentityFlowComponent),
  },
  {
    path: 'about',
    title: 'About | Learnova',
    loadComponent: () =>
      import('./components/shared/about/about').then((component) => component.About),
  },
  {
    path: 'contact',
    title: 'Contact | Learnova',
    loadComponent: () =>
      import('./components/shared/contact-us/contact-us').then((component) => component.ContactUs),
  },
  policy('privacy', 'privacy', 'Privacy'),
  policy('terms', 'terms', 'Terms of use'),
  policy('accessibility', 'accessibility', 'Accessibility'),
  {
    path: 'credentials',
    title: 'Verify a credential | Learnova',
    loadComponent: () =>
      import('./features/learner/credentials/credential-verify').then(
        (component) => component.CredentialVerifyComponent,
      ),
  },
  {
    path: 'credentials/:verificationCode',
    title: 'Credential verification | Learnova',
    loadComponent: () =>
      import('./features/learner/credentials/credential-verify').then(
        (component) => component.CredentialVerifyComponent,
      ),
  },
  {
    path: 'course/:id',
    title: 'Course | Learnova',
    loadComponent: () =>
      import('./components/course/course-detail/course-detail').then(
        (component) => component.CourseDetailComponent,
      ),
  },
  {
    path: 'course/:id/learn',
    title: 'Course player | Learnova',
    canActivate: [authGuard, enrolledGuard],
    loadComponent: () =>
      import('./components/course/course-learn/course-learn').then(
        (component) => component.CourseLearn,
      ),
  },
  {
    path: 'course/:courseId/quiz/list',
    title: 'Course quizzes | Learnova',
    canActivate: [authGuard, quizEnrolledGuard],
    loadComponent: () =>
      import('./components/quiz/quiz-list/quiz-list').then(
        (component) => component.QuizListComponent,
      ),
  },
  {
    path: 'course/:courseId/quiz/:quizId/attempt',
    title: 'Quiz attempt | Learnova',
    canActivate: [authGuard, quizEnrolledGuard],
    loadComponent: () =>
      import('./components/quiz/quiz-attempt/quiz-attempt').then(
        (component) => component.QuizAttemptComponent,
      ),
  },
  {
    path: 'course/:courseId/quiz/results',
    title: 'Quiz results | Learnova',
    loadComponent: () =>
      import('./components/quiz/quiz-result/quiz-result').then(
        (component) => component.QuizResultsComponent,
      ),
  },
  {
    path: 'student',
    canActivate: [authGuard],
    data: { expectedRole: 'Student' },
    loadComponent: () =>
      import('./components/student/student').then((component) => component.StudentLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Learning dashboard | Learnova',
        loadComponent: () =>
          import(
            './components/student/student-dashboard/student-dashboard/student-dashboard'
          ).then((component) => component.StudentDashboardComponent),
      },
      {
        path: 'my-courses',
        title: 'My learning | Learnova',
        loadComponent: () =>
          import('./components/student/my-courses/student-my-courses/student-my-courses').then(
            (component) => component.MyCoursesComponent,
          ),
      },
      {
        path: 'quizzes',
        title: 'Quiz summary | Learnova',
        loadComponent: () =>
          import('./components/student/quiz-summary/quiz-summary').then(
            (component) => component.QuizSummaryComponent,
          ),
      },
      {
        path: 'assessments',
        title: 'Assessments | Learnova',
        loadComponent: () =>
          import('./features/assessments/assessment-list').then((component) => component.AssessmentListComponent),
      },
      {
        path: 'assessments/:assessmentId',
        title: 'Assessment overview | Learnova',
        loadComponent: () =>
          import('./features/assessments/assessment-overview').then((component) => component.AssessmentOverviewComponent),
      },
      {
        path: 'assignments',
        title: 'Assignments | Learnova',
        loadComponent: () =>
          import('./features/learner/assignments/assignment-list').then((component) => component.AssignmentListComponent),
      },
      {
        path: 'assignments/:assignmentId',
        title: 'Assignment | Learnova',
        loadComponent: () =>
          import('./features/learner/assignments/assignment-detail').then((component) => component.AssignmentDetailComponent),
      },
      {
        path: 'discussions',
        title: 'Discussions | Learnova',
        loadComponent: () =>
          import('./features/learner/discussions/discussions').then((component) => component.DiscussionsComponent),
      },
      {
        path: 'notes',
        title: 'Notes | Learnova',
        loadComponent: () => import('./features/learner/notes/notes').then((component) => component.NotesComponent),
      },
      {
        path: 'live',
        title: 'Live sessions | Learnova',
        canActivate: [featureFlagGuard],
        data: { featureFlag: 'liveLearning' },
        loadComponent: () =>
          import('./features/advanced/live/live-sessions').then((component) => component.LiveSessionsComponent),
      },
      {
        path: 'review',
        title: 'Daily review | Learnova',
        data: { mode: 'review' },
        loadComponent: () => import('./features/learner/learner-hub/learner-hub').then((component) => component.LearnerHubComponent),
      },
      {
        path: 'calendar',
        title: 'Learning calendar | Learnova',
        data: { mode: 'calendar' },
        loadComponent: () => import('./features/learner/learner-hub/learner-hub').then((component) => component.LearnerHubComponent),
      },
      {
        path: 'skills',
        title: 'Skills | Learnova',
        data: { mode: 'skills' },
        loadComponent: () => import('./features/learner/learner-hub/learner-hub').then((component) => component.LearnerHubComponent),
      },
      {
        path: 'certificates',
        title: 'Certificates | Learnova',
        data: { mode: 'certificates' },
        loadComponent: () => import('./features/learner/learner-hub/learner-hub').then((component) => component.LearnerHubComponent),
      },
      {
        path: 'notifications',
        title: 'Notifications | Learnova',
        data: { mode: 'notifications' },
        loadComponent: () => import('./features/learner/learner-hub/learner-hub').then((component) => component.LearnerHubComponent),
      },
      {
        path: 'messages',
        title: 'Messages | Learnova',
        data: { mode: 'messages' },
        loadComponent: () => import('./features/learner/learner-hub/learner-hub').then((component) => component.LearnerHubComponent),
      },
      {
        path: 'achievements',
        title: 'Achievements | Learnova',
        data: { mode: 'achievements' },
        loadComponent: () => import('./features/learner/learner-hub/learner-hub').then((component) => component.LearnerHubComponent),
      },
      {
        path: 'settings',
        title: 'Settings | Learnova',
        data: { mode: 'settings' },
        loadComponent: () => import('./features/learner/learner-hub/learner-hub').then((component) => component.LearnerHubComponent),
      },
      {
        path: 'profile',
        title: 'Profile | Learnova',
        loadComponent: () =>
          import('./components/profile/user-profile/user-profile').then(
            (component) => component.ProfileComponent,
          ),
        children: [
          { path: '', redirectTo: 'public-profile', pathMatch: 'full' },
          {
            path: 'public-profile',
            loadComponent: () =>
              import('./components/profile/public-profile/public-profile').then(
                (component) => component.PublicProfileComponent,
              ),
          },
          {
            path: 'photo',
            loadComponent: () =>
              import('./components/profile/photo-profile/photo-profile').then(
                (component) => component.PhotoProfileComponent,
              ),
          },
        ],
      },
    ],
  },
  { path: 'learn/dashboard', redirectTo: 'student/dashboard', pathMatch: 'full' },
  { path: 'learn/my-learning', redirectTo: 'student/my-courses', pathMatch: 'full' },
  { path: 'learn/calendar', redirectTo: 'student/calendar', pathMatch: 'full' },
  { path: 'learn/review', redirectTo: 'student/review', pathMatch: 'full' },
  { path: 'learn/skills', redirectTo: 'student/skills', pathMatch: 'full' },
  { path: 'learn/certificates', redirectTo: 'student/certificates', pathMatch: 'full' },
  { path: 'learn/notifications', redirectTo: 'student/notifications', pathMatch: 'full' },
  { path: 'learn/messages', redirectTo: 'student/messages', pathMatch: 'full' },
  { path: 'learn/settings', redirectTo: 'student/settings', pathMatch: 'full' },
  { path: 'learn/achievements', redirectTo: 'student/achievements', pathMatch: 'full' },
  { path: 'learn/profile', redirectTo: 'student/profile', pathMatch: 'full' },
  { path: 'learn/assessments/:assessmentId/overview', redirectTo: 'student/assessments/:assessmentId' },
  { path: 'learn/assignments/:assignmentId', redirectTo: 'student/assignments/:assignmentId' },
  { path: 'learn/courses/:courseId/notes', redirectTo: 'student/notes' },
  { path: 'learn/courses/:courseId/discussions', redirectTo: 'student/discussions' },
  {
    path: 'learn/attempts/:attemptId',
    title: 'Assessment attempt | Learnova',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/assessments/attempt-shell').then((component) => component.AttemptShellComponent),
  },
  {
    path: 'learn/attempts/:attemptId/result',
    title: 'Attempt result | Learnova',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/assessments/attempt-result').then((component) => component.AttemptResultComponent),
  },
  {
    path: 'learn/live/:sessionId',
    title: 'Live session | Learnova',
    canActivate: [authGuard, featureFlagGuard],
    data: { featureFlag: 'liveLearning' },
    loadComponent: () =>
      import('./features/advanced/live/live-room').then((component) => component.LiveRoomComponent),
  },
  {
    path: 'learn/labs/:labId',
    title: 'Practice lab | Learnova',
    canActivate: [authGuard, featureFlagGuard],
    data: { featureFlag: 'labs' },
    loadComponent: () =>
      import('./features/advanced/labs/code-lab').then((component) => component.CodeLabComponent),
  },
  {
    path: 'instructor',
    canActivate: [authGuard],
    data: { expectedRole: 'Instructor' },
    loadComponent: () =>
      import('./components/instructor/instructor').then(
        (component) => component.InstructorLayout,
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Teaching dashboard | Learnova',
        loadComponent: () =>
          import('./features/instructor/instructor-overview').then(
            (component) => component.InstructorOverviewComponent,
          ),
      },
      {
        path: 'summary',
        title: 'Teaching summary | Learnova',
        loadComponent: () =>
          import('./components/instructor/instructor-dashboard/instructor-dashboard').then(
            (component) => component.InstructorDashboardComponent,
          ),
      },
      {
        path: 'studio',
        title: 'Course studio | Learnova',
        loadComponent: () =>
          import('./features/instructor/studio/studio-list').then((component) => component.StudioListComponent),
      },
      {
        path: 'studio/:courseId',
        title: 'Course studio | Learnova',
        loadComponent: () =>
          import('./features/instructor/studio/course-studio').then((component) => component.CourseStudioComponent),
      },
      {
        path: 'question-bank',
        title: 'Question bank | Learnova',
        loadComponent: () =>
          import('./features/instructor/question-bank/question-bank').then((component) => component.QuestionBankComponent),
      },
      {
        path: 'grading',
        title: 'Grading | Learnova',
        loadComponent: () =>
          import('./features/instructor/grading/grading').then((component) => component.GradingComponent),
      },
      {
        path: 'analytics',
        title: 'Course analytics | Learnova',
        loadComponent: () =>
          import('./features/instructor/analytics/instructor-analytics').then((component) => component.InstructorAnalyticsComponent),
      },
      {
        path: 'live',
        title: 'Live sessions | Learnova',
        canActivate: [featureFlagGuard],
        data: { featureFlag: 'liveLearning' },
        loadComponent: () =>
          import('./features/advanced/live/live-sessions').then((component) => component.LiveSessionsComponent),
      },
      {
        path: 'courses',
        title: 'Instructor courses | Learnova',
        loadComponent: () =>
          import('./components/instructor/instructor-courses/instructor-courses').then(
            (component) => component.InstructorCoursesComponent,
          ),
      },
      {
        path: 'createcourse',
        title: 'Create course | Learnova',
        loadComponent: () =>
          import('./components/instructor/instructor-createcourse/instructor-createcourse').then(
            (component) => component.InstructorCreateCourseComponent,
          ),
      },
      {
        path: 'quiz-builder/:courseId',
        title: 'Quiz builder | Learnova',
        loadComponent: () =>
          import('./components/quiz/quiz-create/create-quiz-questions/create-quiz-questions').then(
            (component) => component.CreateQuizQuestionsComponent,
          ),
      },
      {
        path: 'profile',
        title: 'Instructor profile | Learnova',
        loadComponent: () =>
          import('./components/profile/user-profile/user-profile').then(
            (component) => component.ProfileComponent,
          ),
        children: [
          { path: '', redirectTo: 'public-profile', pathMatch: 'full' },
          {
            path: 'public-profile',
            loadComponent: () =>
              import('./components/profile/public-profile/public-profile').then(
                (component) => component.PublicProfileComponent,
              ),
          },
          {
            path: 'photo',
            loadComponent: () =>
              import('./components/profile/photo-profile/photo-profile').then(
                (component) => component.PhotoProfileComponent,
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { expectedRole: 'Admin' },
    loadComponent: () =>
      import('./components/admin/layout/layout').then((component) => component.AdminLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      adminConsole('dashboard', 'overview', 'Operations overview'),
      {
        path: 'insights',
        title: 'User insights | Learnova',
        loadComponent: () =>
          import('./components/admin/dashboard/dashboard').then(
            (component) => component.AdminDashboard,
          ),
      },
      adminConsole('roles', 'roles', 'Roles'),
      adminConsole('moderation', 'moderation', 'Moderation'),
      adminConsole('organizations', 'organizations', 'Organizations'),
      adminConsole('audit', 'audit', 'Audit log'),
      adminConsole('integrations', 'integrations', 'Integrations'),
      adminConsole('jobs', 'jobs', 'Background jobs'),
      adminConsole('system-health', 'health', 'System health'),
      adminConsole('feature-flags', 'flags', 'Feature flags'),
      {
        path: 'users',
        title: 'Manage users | Learnova',
        loadComponent: () =>
          import('./components/admin/manage-users/manage-users').then(
            (component) => component.ManageUsers,
          ),
      },
      {
        path: 'courses',
        title: 'Manage courses | Learnova',
        loadComponent: () =>
          import('./components/admin/manage-courses/manage-courses').then(
            (component) => component.ManageCourses,
          ),
      },
      {
        path: 'profile',
        title: 'Administrator profile | Learnova',
        loadComponent: () =>
          import('./components/profile/user-profile/user-profile').then(
            (component) => component.ProfileComponent,
          ),
        children: [
          { path: '', redirectTo: 'public-profile', pathMatch: 'full' },
          {
            path: 'public-profile',
            loadComponent: () =>
              import('./components/profile/public-profile/public-profile').then(
                (component) => component.PublicProfileComponent,
              ),
          },
        ],
      },
    ],
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'teach/dashboard', redirectTo: 'instructor/dashboard', pathMatch: 'full' },
  { path: 'teach/courses', redirectTo: 'instructor/studio', pathMatch: 'full' },
  { path: 'teach/courses/new', redirectTo: 'instructor/createcourse', pathMatch: 'full' },
  { path: 'teach/courses/:courseId/overview', redirectTo: 'instructor/studio/:courseId' },
  { path: 'teach/courses/:courseId/analytics', redirectTo: 'instructor/analytics' },
  { path: 'teach/question-banks', redirectTo: 'instructor/question-bank', pathMatch: 'full' },
  { path: 'teach/grading', redirectTo: 'instructor/grading', pathMatch: 'full' },
  {
    path: 'org/:organizationId',
    canActivate: [authGuard, featureFlagGuard],
    data: { expectedRole: 'Admin', featureFlag: 'enterprise' },
    loadComponent: () =>
      import('./features/organization/organization-layout').then((component) => component.OrganizationLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      orgPage('dashboard', 'dashboard', 'Organization dashboard'),
      orgPage('members', 'members', 'Members'),
      orgPage('cohorts', 'cohorts', 'Cohorts'),
      orgPage('branding', 'branding', 'Branding'),
      orgPage('sso', 'sso', 'Single sign-on'),
    ],
  },
  {
    path: 'feature-unavailable',
    title: 'Feature unavailable | Learnova',
    data: {
      code: 'Preview',
      eyebrow: 'Not enabled yet',
      heading: 'This feature is not available in your environment',
      message: 'It is being rolled out gradually. Your administrator can enable it when it is ready.',
      actionLabel: 'Return home',
      actionLink: '/home',
    },
    loadComponent: () =>
      import('./components/shared/route-state/route-state').then(
        (component) => component.RouteStateComponent,
      ),
  },
  { path: 'unauthorized', redirectTo: '403', pathMatch: 'full' },
  {
    path: '403',
    title: 'Access denied | Learnova',
    data: {
      code: '403',
      eyebrow: 'Access denied',
      heading: 'You do not have access to this area',
      message: 'Your account is active, but this page requires a different permission.',
      actionLabel: 'Return home',
      actionLink: '/home',
    },
    loadComponent: () =>
      import('./components/shared/route-state/route-state').then(
        (component) => component.RouteStateComponent,
      ),
  },
  {
    path: 'maintenance',
    title: 'Maintenance | Learnova',
    data: {
      code: '503',
      eyebrow: 'Scheduled maintenance',
      heading: 'We are preparing a better learning experience',
      message: 'Your work is safe. Please return shortly and continue where you left off.',
      actionLabel: 'Try the home page',
      actionLink: '/home',
    },
    loadComponent: () =>
      import('./components/shared/route-state/route-state').then(
        (component) => component.RouteStateComponent,
      ),
  },
  {
    path: '404',
    title: 'Page not found | Learnova',
    data: {
      code: '404',
      eyebrow: 'Page not found',
      heading: 'This page has moved or no longer exists',
      message: 'Check the address, or head back to discover your next course.',
      actionLabel: 'Explore learning',
      actionLink: '/home',
    },
    loadComponent: () =>
      import('./components/shared/route-state/route-state').then(
        (component) => component.RouteStateComponent,
      ),
  },
  { path: '**', redirectTo: '404' },
];
