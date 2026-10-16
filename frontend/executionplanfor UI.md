# LMS Frontend/UI Complete Execution Plan
# LMS Frontend/UI Complete Execution Plan

## 1. Purpose

This document is the frontend counterpart to `LMS/execution plan.md`. It is based on the current Angular code in `lms frontend/LMS_Frontend` and covers both:

1. The UI that exists today and must remain usable during migration.
2. The complete target UI required by the backend execution plan.
3. A mock-first architecture that allows frontend work to proceed before backend features are complete.
4. The contracts, adapters, feature flags, tests, and integration gates needed to merge frontend and backend safely.

The target is an accessible, responsive, role-aware Angular LMS for public visitors, learners, instructors, administrators, organization administrators, graders/moderators, and support staff.

---

## 2. Current Frontend Baseline

### 2.1 Technology currently present

- Angular 20 standalone application.
- TypeScript 5.9 and RxJS 7.8.
- Angular Material and Angular CDK.
- Template-driven forms in most existing flows.
- Angular signals in course detail and learning views.
- Chart.js/ng2-charts for admin analytics.
- ApexCharts/ng-apexcharts for learner analytics.
- JWT decoding with `jwt-decode`.
- A single development API URL in `src/environment.ts`.
- CSS variables in `src/styles.css` plus an Angular Material theme in `src/custom-theme.scss`.
- Poppins and Roboto are both configured, producing an inconsistent typography baseline.
- Karma/Jasmine test setup with only limited generated component specifications.

### 2.2 Current user-facing areas

#### Public

- Home/catalog with local course search and category rows.
- Course cards and course detail.
- Login.
- Student registration.
- Instructor registration.
- About and contact pages.
- Unauthorized page; currently also used as the wildcard destination.

#### Learner

- Learner layout and dashboard.
- Enrolled-course list.
- Course learning/player view.
- Quiz list, timed quiz attempt, and results.
- Quiz summary.
- Profile details and profile photo.

#### Instructor

- Instructor layout and dashboard.
- Instructor course list.
- Multi-step category/course/lesson creation.
- Quiz builder and quiz management views.
- Shared profile views.

#### Administrator

- Admin layout and dashboard.
- User management.
- Course moderation/status management.
- Shared profile views.

### 2.3 Current routes that must be supported during migration

| Area | Existing route |
|---|---|
| Home | `/home` |
| Login | `/login` |
| Student registration | `/register` |
| Instructor registration | `/register-instructor` |
| Course detail | `/course/:id` |
| Course player | `/course/:id/learn` |
| Quiz list | `/course/:courseId/quiz/list` |
| Quiz attempt | `/course/:courseId/quiz/:quizId/attempt` |
| Quiz results | `/course/:courseId/quiz/results` |
| Student area | `/student/...` |
| Instructor area | `/instructor/...` |
| Admin area | `/admin/...` |
| About/contact | `/about`, `/contact` |

### 2.4 Current API dependencies observed in frontend services

The existing frontend directly calls unversioned routes under `/api`, including:

- `/Auth/login`
- `/Auth/register`
- `/Auth/register/instructor`
- `/Course` and `/Course/:id`
- `/Course/status/:id`
- `/Course/:id/document`
- `/Course/material/:id`
- `/CourseCategories`
- `/Lesson` and `/Lesson/:id`
- `/Lesson/:id/document`
- `/Enrollment`
- `/Enrollment/is-enrolled/:courseId`
- `/Enrollment/user/courses`
- `/Quiz/...`
- `/Question/...`
- `/Answer`
- `/QuizScore/...`
- `/UserManagement/me`
- `/UserManagement/admin/users/...`
- `/UserManagement/instructor/courses`
- `/UserManagement/instructor/analytics`
- Student dashboard and quiz-summary endpoints.

These calls must not be scattered through new feature components. They will be wrapped by repositories/gateways and legacy adapters.

### 2.5 Current issues the frontend plan must resolve

1. Routes are eagerly imported and contain duplicate profile and root redirects.
2. Wildcard navigation goes to unauthorized instead of a true 404 page.
3. Guards use role strings and numeric IDs derived directly from current JWT claims.
4. Tokens are stored in `localStorage`; there is no refresh-token rotation or session recovery.
5. Both services and interceptors add authorization headers.
6. Token key usage is inconsistent (`auth_token` versus `authToken`).
7. API IDs are numeric and tightly coupled to current backend entities.
8. Current models mirror backend shapes and mix API DTOs, forms, and view models.
9. `any`, optional ID aliases, Pascal/camel-case fallbacks, and placeholder values hide contract problems.
10. API base URLs and upload URLs are hardcoded in several places.
11. Course creation contains placeholder edit data and creates the course more than once if details are saved repeatedly.
12. Category creation is available to instructors without a defined approval/permission workflow.
13. Course content supports primarily video plus one attachment rather than sections and content blocks.
14. Quiz execution submits each answer separately and stores result navigation state only in memory.
15. Timer, attempt recovery, autosave, offline behavior, and anti-double-submit handling are incomplete.
16. There is no centralized RFC 9457 error handling, loading strategy, notification system, or retry policy.
17. Forms are mostly template-driven and lack reusable server-error mapping.
18. Component styles are fragmented and may exceed the configured production style budgets.
19. Two chart libraries overlap.
20. There is no complete component library, Storybook-equivalent catalog, visual regression suite, or Playwright suite.
21. Accessibility, localization, RTL, dark mode, reduced motion, and responsive behavior are not consistently implemented.
22. The app has no PWA/offline architecture.
23. Current profile streams are HTTP calls rather than a true cached user state despite comments suggesting otherwise.
24. Subscriptions and route-event subscriptions are not consistently destroyed.
25. Public pages can issue authenticated profile requests unnecessarily.

---

## 3. Frontend Product Principles

Every UI implementation must follow these rules:

1. **Learning outcome first:** prioritize mastery, retention, actionable feedback, and learner progress.
2. **Accessible by default:** WCAG 2.2 AA is a definition-of-done requirement.
3. **Mock first, contract driven:** build against typed ports and fixtures, not unfinished endpoints.
4. **Backend independent:** no component may depend directly on generated/raw transport DTOs.
5. **Progressive delivery:** advanced areas remain behind feature flags until their APIs and policies are ready.
6. **Mobile first:** core learning, review, notifications, and download flows work on narrow screens.
7. **Resilient:** preserve drafts and attempts; clearly distinguish retryable, offline, forbidden, and validation failures.
8. **Explainable:** adaptive recommendations and risk indicators always show human-readable reasons.
9. **Privacy preserving:** visibility, consent, AI use, analytics, and export/deletion controls are explicit.
10. **Consistent:** one design system, one charting strategy, one API error format, and shared state patterns.

---

## 4. Target Angular Architecture

### 4.1 Proposed source organization

```text
src/app/
  core/
    auth/
    config/
    errors/
    feature-flags/
    http/
    i18n/
    logging/
    realtime/
    session/
    storage/
  layout/
    public-shell/
    learner-shell/
    instructor-shell/
    admin-shell/
    organization-shell/
  shared/
    ui/
    forms/
    directives/
    pipes/
    a11y/
    models/
    utilities/
  features/
    auth/
    catalog/
    courses/
    learning-player/
    learning-paths/
    assessments/
    assignments/
    discussions/
    notes/
    notifications/
    calendar/
    profile/
    skills/
    review/
    certificates/
    gamification/
    search/
    instructor-studio/
    instructor-analytics/
    admin/
    organizations/
    live-learning/
    ai-assistant/
    labs/
    settings/
  data-access/
    contracts/
    gateways/
    http/
    mock/
    mappers/
  store/
    session/
    preferences/
    notifications/
```

### 4.2 Boundaries

- Feature components consume facade/store interfaces only.
- Facades consume domain-oriented gateway interfaces.
- HTTP implementations map transport DTOs into frontend domain models.
- Mock implementations satisfy the same gateway interfaces.
- Legacy adapters normalize the current unversioned API.
- Target adapters consume `/api/v1/...` contracts.
- No component builds URLs, decodes raw JWT claims, or reads `localStorage` directly.
- Shared UI cannot import role-specific feature code.
- Feature folders are lazy-loaded through route-level `loadComponent` or `loadChildren`.

### 4.3 State management

Use Angular signals and RxJS deliberately before introducing another state package.

- Signal stores/facades for feature state.
- RxJS for HTTP, realtime streams, cancellation, and orchestration.
- URL query parameters for shareable filters, sort, tabs, page, and search state.
- Session store for authenticated user, effective permissions, tenant, and active organization.
- Preferences store for theme, density, locale, captions, playback speed, and accessibility mode.
- IndexedDB for offline lessons, local drafts, attempt autosave, and queued synchronization.
- Server remains authoritative for permissions, scores, enrollment, payments, and certificates.

### 4.4 Required cross-cutting infrastructure

- Runtime configuration loaded before bootstrap.
- API version header/base URL selection.
- Correlation ID propagation.
- Authorization interceptor.
- Refresh/session recovery interceptor with a single-flight refresh request.
- RFC 9457 `ProblemDetails` parser.
- Retry only for safe/idempotent operations and transient failures.
- Global error boundary and route error pages.
- Online/offline service.
- Feature flag service.
- Telemetry abstraction with privacy filtering.
- SignalR connection manager with reconnect/backoff.
- Upload manager with progress, cancellation, retry, and signed URL support.
- Notification/toast service and confirmation-dialog service.
- Title/meta/breadcrumb service.
- Unsaved-changes and in-progress-assessment guards.

---

## 5. Design System and UI Foundation

### 5.1 Visual system

Create semantic tokens rather than hardcoded component colors:

- Brand, accent, neutral, success, warning, danger, and information palettes.
- Surface levels and borders for light, dark, and high-contrast modes.
- Typography scale for display, page title, section heading, body, caption, and code.
- Spacing, radius, elevation, motion duration, and responsive breakpoint tokens.
- Data-visualization palette that remains distinguishable for color-vision deficiencies.
- One font family unless product design explicitly approves separate display/body fonts.

Synchronize custom CSS variables with Angular Material theme tokens. Remove duplicate body and typography declarations. Respect `prefers-color-scheme`, `prefers-reduced-motion`, and user overrides.

### 5.2 Shared UI primitives

Build and document:

- App header, side navigation, bottom navigation, breadcrumbs, and command/search launcher.
- Buttons, icon buttons, links, menu items, chips, badges, avatars, and status indicators.
- Text, select, autocomplete, date/time, rich-text, file, tag, and code inputs.
- Form field error summary and server validation mapper.
- Card, metric card, content card, course card, learning-path card, and certificate card.
- Responsive data table, filter bar, pagination, bulk-action bar, and empty state.
- Tabs, stepper, expansion panels, timeline, progress ring/bar, and skeleton loaders.
- Dialog, drawer, popover, tooltip, snackbar, banner, and destructive confirmation.
- Media player controls, transcript panel, captions selector, and chapter list.
- Question renderers and authoring controls for every supported question type.
- Chart wrapper with table/text fallback.
- Error state, forbidden state, not-found state, maintenance state, and offline state.

### 5.3 Responsive shells

- Public shell: navigation, search, sign-in/register actions, footer.
- Learner shell: desktop sidebar, tablet rail, mobile bottom navigation.
- Instructor shell: studio navigation with draft/publish status and contextual actions.
- Admin shell: dense operations navigation and tenant context.
- Focus mode shell: distraction-free lesson, quiz, review, lab, and live-session experiences.

### 5.4 Accessibility requirements

- Semantic landmarks and one logical page-level heading.
- Skip links to main content and contextual navigation.
- Full keyboard support, including drag/reorder alternatives.
- Visible focus indicators with sufficient contrast.
- Correct labels, descriptions, errors, and required state for controls.
- Status changes announced through appropriately scoped live regions.
- Dialog focus trapping and focus restoration.
- No meaning conveyed only by color, position, sound, or motion.
- Captions, transcripts, audio-description support, and accessible media controls.
- Assessment accommodations for extended time, pause rules, and screen readers.
- Minimum target size and zoom support through 400%.
- Automated axe checks plus manual keyboard and screen-reader acceptance.

---

## 6. Target Information Architecture and Routes

Use public opaque identifiers (`coursePublicId`, `attemptPublicId`, etc.) in target routes. Legacy numeric routes remain as redirects/adapters during migration.

### 6.1 Public routes

- `/` — personalized or public landing page.
- `/catalog` — paginated course, path, and skill catalog.
- `/catalog/courses/:courseId` — course marketing/detail page.
- `/catalog/paths/:pathId` — learning-path detail.
- `/search` — full-text/semantic search results.
- `/instructors/:profileId` — public instructor profile.
- `/credentials/:verificationCode` — public certificate/credential verification.
- `/skills/:profileId` — shareable skill passport subject to visibility settings.
- `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`.
- `/auth/mfa`, `/auth/callback`, `/auth/session-expired`.
- `/about`, `/contact`, `/privacy`, `/terms`, `/accessibility`.
- `/404`, `/403`, `/maintenance`.

### 6.2 Learner routes

- `/learn/dashboard`
- `/learn/my-learning`
- `/learn/calendar`
- `/learn/paths/:pathId`
- `/learn/courses/:courseId`
- `/learn/courses/:courseId/lessons/:lessonId`
- `/learn/courses/:courseId/discussions`
- `/learn/courses/:courseId/notes`
- `/learn/assessments/:assessmentId/overview`
- `/learn/attempts/:attemptId`
- `/learn/attempts/:attemptId/result`
- `/learn/assignments/:assignmentId`
- `/learn/review`
- `/learn/skills`
- `/learn/certificates`
- `/learn/achievements`
- `/learn/notifications`
- `/learn/messages`
- `/learn/live/:sessionId`
- `/learn/labs/:labId`
- `/learn/profile`
- `/learn/settings/...`

### 6.3 Instructor routes

- `/teach/dashboard`
- `/teach/courses`
- `/teach/courses/new`
- `/teach/courses/:courseId/overview`
- `/teach/courses/:courseId/curriculum`
- `/teach/courses/:courseId/settings`
- `/teach/courses/:courseId/preview`
- `/teach/courses/:courseId/publish`
- `/teach/courses/:courseId/students`
- `/teach/courses/:courseId/analytics`
- `/teach/courses/:courseId/discussions`
- `/teach/question-banks`
- `/teach/assessments/...`
- `/teach/assignments/...`
- `/teach/grading`
- `/teach/rubrics`
- `/teach/live-sessions`
- `/teach/cohorts`
- `/teach/content-intelligence`
- `/teach/skills`
- `/teach/interventions`
- `/teach/profile`
- `/teach/settings`

### 6.4 Platform and organization administration routes

- `/admin/dashboard`
- `/admin/users`
- `/admin/roles`
- `/admin/courses`
- `/admin/categories`
- `/admin/content-moderation`
- `/admin/organizations`
- `/admin/audit`
- `/admin/notifications`
- `/admin/integrations`
- `/admin/jobs`
- `/admin/system-health`
- `/admin/feature-flags`
- `/admin/settings`
- `/org/:organizationId/dashboard`
- `/org/:organizationId/members`
- `/org/:organizationId/cohorts`
- `/org/:organizationId/catalog`
- `/org/:organizationId/analytics`
- `/org/:organizationId/branding`
- `/org/:organizationId/sso`
- `/org/:organizationId/billing`

---

## 7. Complete Screen and Workflow Plan

## 7.1 Identity, Authentication, and Account Security

### Screens

- Login with email/password and optional enterprise SSO providers.
- Registration with learner/instructor intent selected through policy, not separate insecure privilege creation.
- Email verification and resend flow.
- Forgot/reset password.
- MFA enrollment, QR/manual key, verification, recovery codes, and disable confirmation.
- Active sessions with device, location approximation, last active, and revoke action.
- Account lockout/rate-limit state with safe guidance.
- Consent and policy acceptance.
- Session-expired recovery preserving intended destination and unsaved safe drafts.

### Frontend behavior

- Replace direct JWT claim assumptions with a normalized `SessionUser` and permissions array.
- Route authorization checks permissions such as `courses.manage`, not only role names.
- Preserve `returnUrl` safely and reject external/open-redirect values.
- Never display whether an unknown email exists during recovery.
- Do not log tokens or sensitive identity payloads.
- Keep access tokens in memory where backend deployment allows secure HttpOnly refresh cookies.
- Show reauthentication UI for sensitive changes.

## 7.2 Public Discovery, Catalog, and Enrollment

### Catalog

- Server-side paginated search.
- Filters for category, skill, level, language, format, duration, rating, availability, accessibility, and price.
- Sort by relevance, newest, rating, popularity, and duration.
- Grid/list toggle, saved search, recent search, and filter chips.
- Skeleton, empty, no-result, partial-error, and offline states.
- SEO metadata and canonical URLs for public pages.

### Course detail

- Hero with title, summary, instructor, rating, enrollment count, language, level, duration, updated date, and call to action.
- Outcomes, skills, prerequisites, audience, requirements, curriculum sections, content types, accessibility details, instructor, reviews, FAQs, and related courses.
- Enrollment/purchase/organization-assigned states.
- Start/continue action for enrolled learners.
- Scheduled cohort selection where applicable.
- Idempotent enrollment with disabled duplicate submission.

### Learning-path detail

- Ordered courses, prerequisite graph, estimated effort, target skills, completion policy, and progress.
- Enrollment/assignment status and next recommended step.

## 7.3 Learner Dashboard and My Learning

### Dashboard

- Continue-learning card with exact last activity.
- Today plan: lessons, deadlines, live sessions, and spaced reviews.
- Adaptive recommendations with reason and dismiss/save actions.
- Mastery summary and weak prerequisite alerts.
- Streak, badges, points, and cohort leaderboard only when enabled.
- Upcoming assignments/live sessions.
- Notifications and instructor feedback.
- Risk/help prompt shown supportively, never as a punitive opaque score.

### My Learning

- Tabs for active, completed, saved, assigned, archived, and learning paths.
- Filters, search, progress, deadline, cohort, and last-access sorting.
- Resume, download, certificate, leave/archive, and feedback actions based on permission/status.
- Empty states that point to catalog or organization assignments.

## 7.4 Learning Player

### Layout

- Responsive curriculum navigation grouped by modules/sections.
- Main content canvas.
- Tabs/drawer for transcript, notes, discussion, resources, AI assistant, and accessibility settings.
- Previous/next, mark complete, bookmark, and course progress.
- Mobile focus mode and persistent compact progress.

### Content block renderers

Implement a registry keyed by block type:

- Rich text.
- HLS/video with captions, transcript, chapters, speed, quality, PiP, and keyboard controls.
- Audio/podcast mode.
- PDF/document.
- Download/resource.
- Image/gallery.
- Embed with allowlisted/sandboxed sources.
- H5P/SCORM package host.
- Code sample and interactive code lab.
- SQL/Python notebook lab.
- Reflection/poll/checkpoint.
- Live-session recording.

Unknown content types render a safe unsupported-content state rather than failing the page.

### Progress

- Send throttled progress events with block, position, duration, and client event ID.
- Show completion-rule requirements.
- Optimistically update safe progress and reconcile with server state.
- Queue offline progress and sync idempotently.
- Display release schedules, locked prerequisites, and an explanation of how to unlock content.

### Notes and bookmarks

- Timestamped/video-linked notes.
- Rich-text or plain-text notes according to product decision.
- Private by default with export/search.
- Highlights and bookmarks with tags.

## 7.5 Assessments and Quiz Attempts

### Assessment overview

- Instructions, availability, due date, time limit, attempts, passing threshold, accommodations, grading method, and allowed resources.
- Explicit start/resume action.
- Prior attempt history and feedback visibility rules.

### Attempt shell

- Server-issued attempt ID, server-aligned deadline, attempt status, autosave status, and connection state.
- Question navigator with answered, flagged, current, and validation states.
- Save-and-next, previous, flag, review, and submit actions.
- Final review screen for unanswered items.
- Confirmation includes unanswered count and irreversible-action warning.
- Resume after refresh/device interruption according to policy.
- Never calculate authoritative grade only in the browser.

### Question renderers

- Single choice.
- Multiple choice.
- True/false.
- Matching with keyboard alternative.
- Ordering with move-up/down controls.
- Fill in the blank.
- Short answer.
- Essay.
- Code challenge with editor and test output.
- File upload with status and malware-scan pending state.

### Results

- Persisted, deep-linkable result route—not memory-only navigation data.
- Score/status, mastery effects, rubric/feedback, question review policy, attempt history, and recommended remediation.
- Clear pending/manual-grading state.
- Retake action when allowed.

## 7.6 Assignments, Submissions, Rubrics, and Peer Review

- Assignment detail with instructions, files, rubric, deadline/time zone, late policy, and submission history.
- Draft autosave.
- Text, link, repository, and file submissions.
- Upload progress, cancellation, retry, scan state, and file validation.
- Final submission and optional resubmission confirmation.
- Rubric-based feedback display.
- Instructor inline feedback and downloadable annotated files.
- Peer-review queue with anonymization rules, conflict reporting, and review deadlines.

## 7.7 Discussions, Study Groups, and Messaging

- Course/thread list with search, filter, sort, pinned/accepted states.
- Thread detail with nested replies, mentions, reactions, attachments, reporting, moderation, and accepted answer.
- Study-group directory and group workspace.
- Presence and typing indicators only when privacy policy permits.
- Notification preferences per channel and event type.
- Real-time updates through a gateway so mock polling and SignalR are interchangeable.

## 7.8 Spaced Repetition and Retention

- Daily review queue with estimated time and due/new counts.
- Flashcard reveal and rating controls: Again, Hard, Good, Easy.
- Keyboard/touch controls and reduced-motion behavior.
- Session summary, retention trend, upcoming load, and missed concept links.
- Card source citation to lesson/question.
- Instructor cohort retention dashboard with concept-level forgetting indicators.

## 7.9 Skills, Adaptive Learning, and Skill Passport

### Learner skill view

- Skill graph/list alternative.
- Mastery level, confidence, evidence, last verified, and decay indicator.
- Prerequisites and recommended activities.
- Explanation drawer for every mastery change/recommendation.

### Skill passport

- Visibility controls by profile, skill, evidence, and artifact.
- Public preview.
- Share link management and revoke action.
- Verifiable credential/download/share actions.

### Adaptive recommendations

- Next-best activity, reason, estimated effort, target skill, expected benefit, and prerequisites.
- Accept, postpone, dismiss, and “not relevant” feedback.
- Never imply certainty unsupported by evidence.

## 7.10 Certificates, Achievements, and Gamification

- Certificate list and detail.
- Public verification with valid, revoked, expired, or not-found state.
- Download/share metadata and evidence.
- Badge gallery, achievement timeline, points ledger, streak calendar, and scoped leaderboard.
- Opt-out/privacy settings and non-gamified alternative progress views.

## 7.11 Instructor Course Studio

Replace the current monolithic course-creation component with a draft-oriented studio.

### Course setup

- Basic information, audience, outcomes, requirements, level, language, category request/selection, price/access, thumbnail, instructors, and settings.
- Reactive forms with draft autosave and server version/concurrency token.
- Validation summary and per-step completion.

### Curriculum builder

- Module/section/lesson/content-block hierarchy.
- Add, edit, duplicate, reorder, move, and delete with undo where possible.
- Keyboard-accessible reordering.
- Draft/published/scheduled states.
- Prerequisite and release-rule editor.
- Completion-rule editor.
- Course version comparison and migration impact warning.

### Media/content workflow

- Direct signed upload.
- Upload queue and resumability.
- Processing states: uploaded, scanning, transcoding, captioning, ready, failed.
- Transcript/caption editor.
- Chapter editor.
- Accessibility checks and remediation tasks.
- Preview as learner at breakpoints and accessibility modes.

### Publishing

- Readiness checklist for required metadata, curriculum, accessibility, assessments, ownership, and policy.
- Validation issues link to exact editor location.
- Publish now, schedule, submit for review, unpublish, archive, and create-new-version actions.
- Concurrency conflict resolution instead of silent overwrite.

## 7.12 Question Bank, Assessment Builder, and Grading

### Question bank

- Search/filter by tags, type, difficulty, skill, objective, usage, and status.
- Bulk tagging, archive, duplicate, import/export, and version history.
- Preview and accessibility validation.

### Assessment builder

- Settings for windows, timing, attempts, pass score, feedback, negative marking, randomization, and integrity rules.
- Fixed questions and pool rules.
- Point totals and validation.
- Learner preview.
- Draft/publish lifecycle.

### Grading

- Queue filtered by course, assessment, status, cohort, due date, and grader.
- Assignment/essay/file/code grading workspace.
- Rubric controls, inline comments, private notes, feedback templates, and return/request-resubmission.
- Blind grading option and audit visibility.
- Bulk release with confirmation.

## 7.13 Instructor Analytics and Early Intervention

- Course funnel: enrolled, activated, progressing, completed, mastered.
- Lesson engagement, video confusion heatmap, assessment item analysis, skill mastery, and retention.
- Cohort comparison with privacy thresholds.
- At-risk learner list with explicit contributing factors.
- Intervention workflow: review, contact, assign remediation, record outcome.
- Export subject to permission and PII safeguards.
- Charts must include accessible tables and definitions.

## 7.14 AI Teaching Assistant and Content Intelligence

### Learner assistant

- Course-scoped chat with citations to paragraphs/timestamps.
- Citation preview and navigate-to-source.
- Socratic mode messaging during graded work.
- Feedback/report controls and clear AI disclosure.
- Streaming/retry/cancel states.
- Access-denied citation state without leaking restricted text.

### Instructor intelligence studio

- Transcription/caption/translation job status.
- Proposed chapters, summaries, quizzes, and flashcards.
- Diff/review/approve/edit/reject workflow; generated content is never auto-published.
- Accessibility and outdated/duplicate-content findings.
- Token/usage visibility according to product needs.

## 7.15 Live Learning and Practice Labs

### Live learning

- Schedule/list/calendar, join readiness, device test, and attendance consent.
- Participant roster, chat, reactions, hand raise, polls, breakout rooms, whiteboard, synchronized playback, and comprehension checks.
- Recording/transcript state and post-session resources.
- Provider adapter for native WebRTC, Teams, or Zoom.

### Labs

- Instructions, files, code editor, terminal/output, visible tests, hidden-test summary, hints, reset, snapshot, and submit.
- Runtime provisioning and timeout states.
- Accessible editor configuration and non-visual alternatives where practical.
- Never trust client test results as final grading evidence.

## 7.16 Administration and Enterprise

### Platform admin

- User search, filters, status, roles, tenant memberships, session revocation, and audit history.
- Course/category moderation and publishing review.
- Organization provisioning and delegated admin.
- Notification templates and delivery logs.
- Audit-log explorer with actor, action, resource, tenant, correlation ID, and time.
- Integration/webhook status and replay controls.
- Background-job/system-health views without exposing secrets.
- Feature flags by environment/tenant/cohort/user.

### Organization admin

- Member invitations/import, groups, delegated roles, seat use, and deactivation.
- Cohorts, assignments, due dates, reminders, and custom catalog.
- Organization analytics and exports.
- Branding preview within controlled theming limits.
- SSO domain/configuration status.
- Billing/invoices/subscription only if monetization is enabled.

## 7.17 Settings, Privacy, and Compliance

- Profile and avatar.
- Account/email/password/MFA/session settings.
- Notification preferences by channel.
- Theme, contrast, reduced motion, dyslexia-friendly mode, text size, captions, playback speed, language, and time zone.
- Consent history and AI/proctoring preferences.
- Public profile/skill passport visibility.
- Data export request status.
- Account deletion/anonymization flow with reauthentication and cooling-off explanation.

---

## 8. Mock-First Development Strategy

### 8.1 Objective

Every feature must be buildable and testable without a running backend. Switching between mock, legacy API, and target API must require configuration only—not component edits.

### 8.2 Gateway pattern

Define frontend-facing interfaces such as:

- `AuthGateway`
- `CatalogGateway`
- `CourseGateway`
- `EnrollmentGateway`
- `LearningGateway`
- `AssessmentGateway`
- `AssignmentGateway`
- `DiscussionGateway`
- `NotificationGateway`
- `SkillGateway`
- `ReviewGateway`
- `CertificateGateway`
- `InstructorStudioGateway`
- `AnalyticsGateway`
- `AdminGateway`
- `OrganizationGateway`
- `AiAssistantGateway`
- `LiveSessionGateway`
- `LabGateway`

Provide three implementations where necessary:

1. `Mock...Gateway` for independent UI work.
2. `Legacy...Gateway` for the current backend.
3. `ApiV1...Gateway` for the redesigned backend.

### 8.3 Mock dataset requirements

Fixtures must include:

- Each role and permission combination.
- Anonymous, authenticated, expired-session, locked, and MFA-required states.
- Empty, minimal, normal, large, and paginated collections.
- Draft, scheduled, published, archived, deleted, and processing resources.
- Long translated text, RTL text, missing images, and inaccessible media warnings.
- Courses with all content block types.
- Every question and grading type.
- Attempts in not-started, active, autosave-failed, submitted, pending-grading, graded, expired, and abandoned states.
- Network latency, transient error, forbidden, not-found, conflict, validation, rate-limit, and server-error scenarios.
- Realtime reconnect and duplicate-event scenarios.
- Offline queue and synchronization-conflict scenarios.

Use deterministic IDs, dates, and seeded pseudo-random generation so tests remain repeatable.

### 8.4 Mock controls

Development-only controls may select:

- Effective user/role/tenant.
- Network latency and error rate.
- Online/offline mode.
- Feature flags.
- Locale, theme, and viewport preset.
- Dataset size and specific scenario.

These controls must never be included in production bundles.

### 8.5 Contract artifacts

Backend and frontend teams must agree on OpenAPI contracts and examples before implementation. Generate transport types/clients into a clearly generated folder, but map them into stable frontend models. CI must detect uncommitted generated changes or contract-breaking changes.

---

## 9. Target API Contract Expectations

### 9.1 Common conventions

- Base path `/api/v1`.
- Public opaque string identifiers.
- UTC ISO 8601 timestamps with offsets.
- `PagedResponse<T>` containing `items`, `page`, `pageSize`, `totalItems`, and `totalPages`, or an agreed cursor equivalent.
- RFC 9457 `ProblemDetails` with stable `code`, `traceId`, and field-level `errors` extension.
- ETag/version supplied for concurrency-sensitive resources.
- Idempotency key support for enrollment, attempt submission, assignment submission, payment, and certificate issue operations.
- Permission data returned through session/user endpoints rather than inferred from route names.
- Upload initialization/finalization contracts for signed object-storage workflows.
- Realtime events include event ID, type, resource ID, version, and UTC timestamp.

### 9.2 Frontend contract models

Keep distinct types for:

- Transport DTO.
- Domain model used by facades.
- Form value/draft.
- View model.
- Command/request payload.

Do not use one mutable `Course` interface for catalog cards, editor drafts, player data, and API updates.

### 9.3 Required API integration states

Every request-driven screen handles:

- Initial/loading.
- Loaded.
- Empty.
- Validation failure.
- Authentication required.
- Forbidden.
- Not found.
- Conflict/stale version.
- Rate limited with retry timing.
- Offline.
- Transient failure with retry.
- Terminal failure with trace/reference ID.

### 9.4 Current-to-target compatibility

- Maintain route redirects from numeric legacy URLs while current links exist.
- Map `courseID`, `quizID`, and similar fields in legacy adapters only.
- Map legacy numeric roles to normalized roles/permissions only in the session adapter.
- Normalize PascalCase/camelCase response differences in transport mappers—not components.
- Keep current unversioned services operational until each feature passes its target adapter integration gate.
- Remove fallback ID probing after target contracts are stable.

---

## 10. Security and Privacy in the UI

- UI permission checks improve experience but never replace backend authorization.
- Sanitize rich content; permit embeds only through an allowlist and sandbox policy.
- Avoid `bypassSecurityTrust...` except in a centralized, validated media URL service.
- Apply CSP-compatible implementation; avoid inline scripts and unsafe dynamic HTML.
- Prevent open redirects and unsafe external links.
- Do not persist secrets, answers for completed attempts, or unnecessary PII.
- Redact telemetry and client logs.
- Validate file extension, size, and declared type client-side while treating server scan as authoritative.
- Display pending malware-scan state before files become downloadable.
- Require reauthentication for email, MFA, password, session, export, and deletion operations.
- Make tenant context visible in enterprise admin screens to reduce cross-tenant mistakes.
- Add confirmation and audit context to destructive/privileged actions.
- Use privacy-aware defaults for profiles, skills, groups, presence, and analytics.

---

## 11. Offline/PWA Plan

### Phase A

- Installable shell and offline fallback.
- Cache static assets safely.
- Online/offline indicator.
- Preserve form drafts locally.

### Phase B

- Explicit lesson download management with size and expiry.
- Cached text, audio/video manifests where licensing permits, transcripts, and attachments.
- Offline progress event queue with idempotent sync.
- Daily-review offline sessions.

### Phase C

- Offline assessment only for explicitly eligible assessments.
- Encrypted local attempt state where required.
- Conflict and expiry handling on reconnect.
- Clear warning that submission is pending server acknowledgement.

Never cache private API responses indiscriminately through the service worker.

---

## 12. Localization and Internationalization

- Externalize all user-facing strings from the first migration phase.
- Support locale-aware date, time, time zone, number, percentage, currency, and plural formatting.
- Store and transmit timestamps in UTC; display in user-selected time zone.
- Ensure layouts support RTL without feature-specific overrides.
- Plan translated captions/transcripts and language switching.
- Avoid text embedded in images.
- Test pseudo-localization and text expansion.

---

## 13. Testing and Quality Strategy

### 13.1 Unit tests

- Mappers, validators, permission checks, timer calculations, progress calculations, and reducer/store behavior.
- Gateway adapters and `ProblemDetails` mapping.
- Offline queue deduplication and retry rules.

### 13.2 Component tests

- Shared UI states and keyboard behavior.
- Form error mapping.
- Every question renderer.
- Course content renderers.
- Role/permission-sensitive action visibility.
- Loading, empty, error, and conflict states.

### 13.3 Contract tests

- Validate mock fixtures against OpenAPI schemas.
- Validate target API responses in integration environments.
- Detect breaking changes to required fields/enums/error codes.

### 13.4 End-to-end tests with Playwright

Critical paths:

1. Register, verify, login, logout, recover password, and MFA.
2. Browse/search/filter a course and enroll.
3. Resume a lesson, complete content, and verify progress.
4. Start, autosave, resume, submit, and review a quiz.
5. Submit an assignment and receive grading feedback.
6. Complete a daily review session.
7. Instructor creates a course, curriculum, assessment, and publishes.
8. Instructor grades and releases feedback.
9. Admin manages a user/course and verifies audit output.
10. Organization admin assigns a cohort/course.
11. Offline lesson progress synchronizes once.
12. Session refresh and expired-session recovery.

Run against mock and integration API modes where practical.

### 13.5 Accessibility tests

- Automated axe scans for every route template and major state.
- Keyboard-only scripted journeys.
- Screen-reader manual testing for player, quiz, authoring, grading, and dialogs.
- Contrast, zoom, reduced-motion, captions, and RTL checks.

### 13.6 Visual regression

Capture shared primitives and major screens at mobile, tablet, desktop, light, dark, high-contrast, and long-text variants.

### 13.7 Performance budgets

- Preserve or tighten Angular production bundle budgets by lazy loading.
- Define route-level budgets for catalog, player, studio, analytics, and live/lab modules.
- Track Core Web Vitals for public pages and interaction latency for authenticated screens.
- Virtualize large lists/tables and curriculum trees.
- Lazy load charting, editors, PDF, AI, live-session, and lab dependencies.
- Optimize responsive images and defer noncritical media.

---

## 14. Telemetry and Product Analytics

Use a typed analytics service rather than direct vendor calls. Events include schema version and exclude answer text, tokens, message content, and unnecessary PII.

Track:

- Search performed/result selected/no result.
- Course/path viewed and enrollment outcome.
- Lesson started/completed and content-block interaction.
- Recommendation shown/accepted/dismissed with reason code.
- Attempt start/resume/submit outcome.
- Review session completion.
- Assignment submission outcome.
- Instructor draft/publish funnel.
- Accessibility mode adoption and client errors.
- Offline queue/sync health.

Operational telemetry must include correlation/trace IDs where returned by the API.

---

## 15. Delivery Phases

## Phase UI-0 — Audit and Stabilization

### Scope

- Fix duplicate routes and add real 403/404 pages.
- Lazy-load role areas.
- Normalize environment/runtime configuration.
- Centralize API and asset URL handling.
- Standardize token key use pending identity redesign.
- Remove duplicate manual auth headers where interceptor applies.
- Add global error parsing and user notification.
- Resolve subscription cleanup using Angular lifecycle utilities.
- Fix current course return URL and quiz-result refresh behavior.
- Add baseline tests for login, catalog, enrollment, course player, and quiz.

### Exit criteria

- Current production build succeeds.
- Existing workflows have smoke tests.
- No component reads tokens or constructs API roots directly.
- Current visual behavior remains functionally available.

## Phase UI-1 — Foundation and Mock Platform

### Scope

- Establish target folders and boundaries.
- Build runtime config, feature flags, session facade, gateway interfaces, mock gateways, and deterministic fixtures.
- Consolidate design tokens and typography.
- Build public/learner/instructor/admin shells.
- Build shared loading/error/empty/form/table/dialog primitives.
- Add Playwright and accessibility test harnesses.
- Add localization foundation.

### Exit criteria

- App runs completely in mock mode.
- CI runs unit, component, build, accessibility, and critical mock E2E tests.
- Shared primitives have documented states.

## Phase UI-2 — Identity, Catalog, Profiles, and Core Learning

### Scope

- New identity/security screens.
- Catalog/search/course/path detail.
- Enrollment.
- Learner dashboard and My Learning.
- Module/content-block learning player.
- Notes, bookmarks, progress, and profile/settings basics.
- Legacy adapters keep current backend usable.

### Exit criteria

- Core learner journey works in mock mode and current API mode.
- Target API contract is agreed for identity, catalog, enrollment, course structure, and progress.

## Phase UI-3 — Assessment, Assignment, and Instructor Core

### Scope

- Resumable assessment shell and all question renderers.
- Results/history.
- Assignment/submission/rubric/feedback.
- Instructor course studio, media state, curriculum builder, preview, and publishing.
- Question bank, assessment builder, and grading queue.

### Exit criteria

- Complete create-to-learn-to-grade journey works with mocks.
- Autosave, conflict, timeout, and upload states are tested.

## Phase UI-4 — Engagement and Platform Services

### Scope

- Notifications, preferences, discussions, study groups, messaging, calendar, and live-session scheduling.
- SignalR gateway integration.
- Search enhancements.
- Certificates, achievements, points, streaks, and leaderboards.
- Initial PWA shell and offline lesson downloads.

### Exit criteria

- Realtime reconnect/deduplication is tested.
- Offline progress sync works idempotently.
- Privacy controls exist for social/gamification features.

## Phase UI-5 — Adaptive Learning and Retention

### Scope

- Skill graph/list and mastery evidence.
- Explainable recommendations.
- Daily spaced-review experience.
- Skill passport and verifiable credential views.
- Instructor cohort mastery/retention analytics.
- Early-intervention workflow.

### Exit criteria

- All recommendations expose reasons and feedback controls.
- Charts have accessible alternatives.
- Privacy threshold and human-review behavior are accepted.

## Phase UI-6 — AI, Content Intelligence, Live Collaboration, and Labs

### Scope

- Grounded AI assistant with citations.
- Instructor AI review/approval workflows.
- Content processing/intelligence studio.
- Live classroom collaboration.
- Code, SQL, and notebook labs.

### Exit criteria

- Access-controlled citations are verified.
- Generated content cannot bypass instructor approval.
- Lab/live failure and fallback paths are tested.

## Phase UI-7 — Enterprise, Offline Expansion, and Hardening

### Scope

- Organization admin, cohort assignment, delegated roles, SSO status, branding, billing if enabled.
- Full localization/RTL.
- Offline review and eligible assessments.
- WCAG 2.2 AA audit/remediation.
- Performance, security, privacy, and resilience hardening.

### Exit criteria

- Production-readiness checklist passes.
- No critical accessibility/security defects.
- Backend target adapters replace migrated legacy adapters.
- Legacy routes/services are removed only after usage and redirect telemetry confirm safety.

---

## 16. Parallel Frontend/Backend Work Matrix

| Frontend can build now with mocks | Backend contract needed before integration |
|---|---|
| Design system and shells | Permission/session shape |
| Catalog and filters | Pagination/filter syntax and course summary DTO |
| Course detail/path UI | Public detail DTOs and enrollment policy |
| Learning player renderers | Module/content block schema and progress events |
| Assessment renderer shell | Attempt lifecycle, snapshots, autosave, deadline semantics |
| Assignment submission UI | Submission versioning and signed upload flow |
| Course studio | Draft/version/concurrency and publish validation contracts |
| Question bank/builder | Question schemas, pool rules, versioning |
| Discussion UI | Thread/reaction/moderation and realtime event contracts |
| Review UI | Scheduling/rating command and due-card DTOs |
| Skills/passport UI | Mastery evidence and visibility contracts |
| AI chat UI | Streaming protocol, citation shape, safety/error codes |
| Analytics UI | Metric definitions, aggregation/privacy thresholds |
| Admin/organization UI | Resource permissions, tenant context, audit DTOs |
| Offline queue | Idempotency and synchronization conflict semantics |

Frontend stories are not blocked by endpoint completion if the contract and examples are approved.

---

## 17. Backend Integration Procedure Per Feature

1. Approve user journey, permissions, state diagram, and OpenAPI examples.
2. Implement frontend domain models and gateway interface.
3. Implement deterministic mock gateway and all UI states.
4. Complete component, accessibility, and mock E2E tests.
5. Generate/update target transport client.
6. Implement API mapper and `ApiV1` gateway.
7. Run contract tests.
8. Run integration environment E2E tests.
9. Compare mock and real API behavior for each state.
10. Enable target adapter behind a feature flag for internal users.
11. Monitor errors, latency, and completion metrics.
12. Roll out gradually and retain instant rollback to legacy/mock only in nonproduction as appropriate.
13. Remove legacy code after stabilization and migration criteria are met.

---

## 18. Proposed Initial Backlog Order

1. Route cleanup, lazy loading, and 403/404/error states.
2. Runtime configuration and URL centralization.
3. Session/auth normalization and HTTP error pipeline.
4. Design token cleanup and shared layout primitives.
5. Gateway interfaces plus mock configuration.
6. Typed paged/error/resource models.
7. Public catalog and course detail migration.
8. Learner shell/dashboard/My Learning migration.
9. Module/content-block learning player.
10. Assessment attempt redesign.
11. Instructor course studio split into focused routes/components.
12. Assignment/grading workflow.
13. Realtime notifications/discussions.
14. Skills/review/certificates.
15. AI/live/labs/enterprise behind flags.

---

## 19. Definition of Ready for a UI Feature

A feature is ready when it has:

- Target users and permissions.
- Journey and edge-state diagram.
- Responsive design for mobile/tablet/desktop.
- Accessibility annotations.
- Approved frontend gateway contract.
- OpenAPI schema/examples or a tracked provisional contract.
- Mock scenarios.
- Analytics and privacy requirements.
- Feature flag and rollout strategy when risk warrants it.

## 20. Definition of Done for a UI Feature

A feature is done when:

- It uses shared design tokens and primitives.
- It is responsive and keyboard operable.
- It meets WCAG 2.2 AA acceptance for its scope.
- Loading, empty, validation, forbidden, not-found, conflict, offline, and retry states are handled.
- It uses typed facades/gateways with no component-level API coupling.
- Mock and real adapters satisfy the same contract tests.
- Unit/component/E2E tests cover critical behavior.
- Telemetry is typed, privacy reviewed, and verified.
- User-facing strings are localizable.
- Performance budgets pass.
- Security review is complete for identity, uploads, rich content, payments, AI, live sessions, and labs as applicable.
- Documentation and support guidance are updated.

---

## 21. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Frontend mocks diverge from backend | Schema-validated fixtures, OpenAPI generation, contract CI |
| Backend redesign breaks current UI | Legacy adapters and feature-by-feature flags |
| Scope becomes too large | Deliver vertical slices in roadmap order; advanced features remain disabled |
| Inconsistent UI from parallel teams | Shared design system, ownership, review checklist, visual regression |
| Assessment data loss | Server attempt ID, autosave, IndexedDB draft, idempotent submit, recovery tests |
| Realtime duplicate/out-of-order events | Event IDs, resource versions, deduplication, reconnect reconciliation |
| Offline sync corrupts progress | Append-only client events, idempotency keys, server reconciliation |
| Accessibility deferred | Accessibility acceptance in every story and CI |
| Bundle size grows with advanced tools | Route-level lazy loading and deferred heavy dependencies |
| Tenant data leakage | Tenant-aware session context, gateway tests, backend authorization, UI context labels |
| AI exposes answers/restricted content | Assessment-aware mode, access-controlled citations, safety feedback and audits |
| Two APIs remain indefinitely | Per-feature migration deadlines and deletion gates |

---

## 22. Decisions Required Before Final Visual Implementation

Product/engineering must confirm:

1. Brand identity, supported themes, and approved typography.
2. Public versus invitation-only instructor registration.
3. Free enrollment, commerce, subscriptions, or organization-only access.
4. Initial target personas and delegated roles.
5. Required locales, RTL languages, and time zones.
6. Native live solution versus Teams/Zoom integration.
7. Offline content licensing and storage limits.
8. Whether graded assessments can be taken offline.
9. AI providers, consent, retention, and graded-work policy.
10. Supported lab languages/runtimes.
11. PWA-only versus future native mobile clients.
12. Required interoperability at launch: LTI, SCORM, xAPI, webhooks.
13. Analytics retention and minimum cohort privacy thresholds.
14. Accessibility testing devices and assistive technologies.

These decisions may change feature configuration and visual detail but do not block the mock-first architecture, design-system work, or core learner/instructor journeys.

---

## 23. Immediate Frontend Starting Sequence

1. Preserve a tagged baseline of the current Angular app and capture screenshots/E2E smoke flows.
2. Stabilize routing, runtime configuration, session handling, and API error handling.
3. Establish the target folder boundaries and mock gateway mechanism.
4. Consolidate the design system and build accessible application shells.
5. Migrate catalog/course detail as the first reference vertical slice.
6. Migrate learner dashboard/My Learning and then the module-based player.
7. Build the resumable assessment shell and instructor course studio against mocks.
8. Integrate each target backend module through adapters only after its contract tests pass.
9. Add adaptive/review features before AI recommendations, matching the backend execution order.
10. Add AI, live collaboration, labs, enterprise, and advanced offline support only behind mature access control, monitoring, and feature flags.

This sequence enables meaningful frontend delivery immediately while keeping integration controlled as the backend evolves from its current API into the complete target platform.

---

# Part II — Professional UI/UX Redesign Master Plan

## 24. Redesign Mandate

This section is the visual, interaction, and experience authority for the LMS redesign. It extends the functional and technical plan above and replaces the appearance of the current frontend with an entirely new product experience.

The finished application must be:

- Neat, calm, modern, and visually cohesive.
- Distinct from the existing frontend rather than a cosmetic reskin.
- Eye-soothing during long learning and administration sessions.
- Interactive and engaging without becoming distracting or game-like in serious workflows.
- Suitable for learners, universities, training providers, and enterprise organizations.
- Trustworthy enough for assessments, certifications, compliance training, and administrative operations.
- Responsive from small mobile devices through large enterprise displays.
- Accessible to WCAG 2.2 AA and usable with keyboard, screen readers, zoom, high contrast, and reduced motion.
- Efficient for repeat users while remaining understandable to first-time users.

The visual redesign must not be assembled page by page without a system. All screens must derive from one product language, shared foundations, repeatable layouts, and documented interaction rules.

---

## 25. Experience Vision

### 25.1 Product personality

The LMS should feel:

- **Confident:** clear hierarchy, deliberate spacing, stable layouts, and unambiguous actions.
- **Warm:** gentle surfaces, human language, supportive feedback, and inviting learning imagery.
- **Focused:** low visual noise in lessons, assessments, and authoring workflows.
- **Intelligent:** contextual recommendations and useful data appear at the right moment.
- **Professional:** dashboards, tables, audit screens, and analytics support real operational work.
- **Progressive:** advanced functionality is discoverable but does not overwhelm new users.
- **Inclusive:** accessibility and personalization are visible first-class capabilities.

### 25.2 Emotional goals by context

| Context | Desired feeling | Design response |
|---|---|---|
| Public discovery | Curious and welcomed | Aspirational content, clear catalog, credible social proof |
| Starting a course | Motivated and oriented | Clear outcomes, effort estimate, simple next action |
| Learning | Calm and focused | Reduced chrome, comfortable reading width, visible progress |
| Assessment | Serious but not stressful | Stable layout, clear timer, autosave reassurance, no unnecessary animation |
| Receiving results | Supported and informed | Constructive hierarchy, next steps, no shame-based colors or language |
| Instructor authoring | In control | Structured workspace, autosave, preview, validation checklist |
| Administration | Efficient and accountable | Dense-but-readable tables, filters, bulk actions, audit context |
| Error or offline | Reassured | Plain-language explanation, preserved work, useful recovery action |

### 25.3 Engagement philosophy

Retention must come from usefulness and progress—not manipulation.

- Show meaningful progress, achievable next steps, and completion momentum.
- Personalize the dashboard using current course activity and deadlines.
- Celebrate genuine milestones with restrained, optional motion.
- Explain recommendations and allow users to dismiss or postpone them.
- Avoid autoplay audio, artificial urgency, infinite-scroll traps, excessive badges, and deceptive notifications.
- Use streaks carefully, provide recovery rules, and never punish learners visually for missing a day.
- Keep assessment and compliance experiences free from promotional distractions.

---

## 26. New Visual Direction: “Calm Momentum”

The proposed visual concept is **Calm Momentum**: a bright, refined workspace combining soft neutral surfaces, a trustworthy blue-teal brand system, warm highlights, generous spacing, and highly legible typography.

### 26.1 Signature characteristics

- Soft off-white page canvas instead of harsh pure white across the entire screen.
- White and subtly tinted elevated surfaces.
- Deep navy text for clarity and trust.
- Azure/indigo as the primary action family.
- Teal as the learning-progress and positive-growth accent.
- Amber used sparingly for attention, upcoming deadlines, and achievements.
- Rounded geometry that feels approachable but not playful.
- Fine borders and restrained shadows rather than floating cards everywhere.
- Subtle gradients only in branded hero areas, progress celebrations, and selected states.
- Purposeful illustrations and authentic learning imagery, never generic decorative clutter.
- Motion that communicates hierarchy, state, continuity, or success.

### 26.2 What must be avoided

- Large areas of saturated magenta or violet from the current default Material theme.
- Random colors assigned per component.
- Excessive gradients, glass effects, neon glows, and heavy shadows.
- Over-rounded controls that make an enterprise product look childish.
- Dense pages built entirely from disconnected cards.
- Small gray text with weak contrast.
- Icon-only controls without labels or accessible names.
- Carousel-dependent discovery that hides content or is difficult to operate.
- Decorative animations in quizzes, grading, or data-entry tasks.
- Multiple competing chart styles and color systems.

---

## 27. Color System

The exact colors must be checked against WCAG contrast in implementation. The following palette is the starting system.

### 27.1 Core light-theme palette

| Token | Proposed value | Purpose |
|---|---:|---|
| `brand-900` | `#172554` | Deep branded backgrounds and high-emphasis text |
| `brand-800` | `#1E3A8A` | Navigation emphasis |
| `brand-700` | `#1D4ED8` | Strong primary interactions |
| `brand-600` | `#2563EB` | Primary button and active control |
| `brand-500` | `#3B82F6` | Hover/accent visualization |
| `brand-100` | `#DBEAFE` | Selected and informational surface |
| `brand-50` | `#EFF6FF` | Subtle branded background |
| `teal-700` | `#0F766E` | Strong learning-progress accent |
| `teal-600` | `#0D9488` | Progress and positive active states |
| `teal-100` | `#CCFBF1` | Positive/progress surface |
| `amber-700` | `#B45309` | Warning text and deadline emphasis |
| `amber-100` | `#FEF3C7` | Warning surface |
| `rose-700` | `#BE123C` | Destructive action and error text |
| `rose-100` | `#FFE4E6` | Error surface |
| `slate-950` | `#0F172A` | Primary text |
| `slate-700` | `#334155` | Secondary text |
| `slate-500` | `#64748B` | Metadata |
| `slate-300` | `#CBD5E1` | Strong borders/dividers |
| `slate-200` | `#E2E8F0` | Standard borders |
| `slate-100` | `#F1F5F9` | Muted surfaces |
| `canvas` | `#F7F9FC` | Main application background |
| `surface` | `#FFFFFF` | Primary surface |

### 27.2 Semantic color roles

- Primary action: `brand-600`; hover `brand-700`; pressed `brand-800`.
- Learning progress: `teal-600` with a text/icon treatment that passes contrast.
- Success: use a distinct accessible green family; do not rely on teal alone.
- Warning/upcoming: amber surface with dark amber text.
- Error/destructive: rose family with explicit icon and text.
- Information: light brand surface with brand text.
- Neutral status: slate surface with dark slate text.
- Focus ring: high-visibility blue with a white separation ring on dark surfaces.

### 27.3 Dark theme

Dark mode is a designed theme, not a color inversion.

- Main canvas near `#0B1220`.
- Primary surface near `#111827`.
- Elevated surface near `#172033`.
- Primary text near `#F8FAFC`.
- Secondary text near `#CBD5E1`.
- Borders near `#334155`.
- Primary blue adjusted lighter for dark-surface contrast.
- Charts use a separately tested dark-theme palette.
- Images, diagrams, code blocks, PDFs, and video controls must be checked independently.

### 27.4 Enterprise theming

- Permit controlled organization branding through logo, primary accent, and approved banner image.
- Preserve semantic colors for warnings, errors, success, and accessibility.
- Automatically reject or adjust tenant colors that fail contrast.
- Do not allow custom CSS injection.
- Provide a branding preview for public, learner, and email contexts.

### 27.5 Color usage ratio

Use an approximate 70/20/10 balance:

- 70% neutral canvas and surfaces.
- 20% text, borders, and muted supporting colors.
- 10% brand/accent color.

This keeps the application calm and prevents the primary color from losing meaning.

---

## 28. Typography and Content Readability

### 28.1 Typeface recommendation

Use **Inter** or **Plus Jakarta Sans** as the primary interface family after licensing and rendering review. Use one family consistently across Angular Material and custom components. A monospace family such as **JetBrains Mono** may be loaded only for code and technical labs.

### 28.2 Type scale

| Style | Desktop guideline | Mobile guideline | Usage |
|---|---:|---:|---|
| Display | 48–56 px | 36–40 px | Marketing hero only |
| Page title | 32–40 px | 28–32 px | Primary page heading |
| Section title | 24–28 px | 22–24 px | Major sections |
| Card title | 18–20 px | 18 px | Cards/panels |
| Body large | 18 px | 17–18 px | Lesson reading and important descriptions |
| Body | 16 px | 16 px | Standard UI content |
| Body small | 14 px | 14 px | Metadata and supporting detail |
| Label | 13–14 px | 13–14 px | Inputs, status, table headers |

### 28.3 Readability rules

- Body line height: approximately 1.5–1.7.
- Lesson reading measure: 60–75 characters per line.
- Avoid center-aligned paragraphs beyond short marketing copy.
- Avoid all-uppercase headings; uppercase may be used only for short data labels.
- Use tabular numerals for timers, scores, and financial values.
- Truncate only where full content is available through expansion or tooltip.
- Support browser zoom and user text-size preferences without clipping.

### 28.4 Content voice

- Concise, respectful, supportive, and action-oriented.
- Prefer “Continue learning” over “Go.”
- Prefer “We couldn’t save your changes” over technical exception text.
- Never blame the user.
- State what happened, whether work was preserved, and what can be done next.
- Use consistent verbs: Create, Save draft, Publish, Submit, Archive, Remove, Restore.

---

## 29. Spacing, Geometry, Elevation, and Iconography

### 29.1 Spacing

Adopt a 4 px base grid with common values of 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, and 80 px.

- Compact table/control spacing: 8–12 px.
- Standard component padding: 16–20 px.
- Prominent card/panel padding: 24–32 px.
- Page section separation: 40–64 px.
- Public marketing section separation: 64–96 px on large screens.

### 29.2 Radius

- Input/button: 8–10 px.
- Standard card/panel: 12–16 px.
- Prominent marketing/feature surface: up to 20–24 px.
- Chips/badges: pill shape only when appropriate.
- Do not apply large radii to dense tables, code editors, or full application frames.

### 29.3 Elevation

- Level 0: page sections and tables using borders only.
- Level 1: standard cards with subtle shadow.
- Level 2: sticky headers, dropdowns, floating action areas.
- Level 3: dialogs and critical overlays.
- Increase elevation on hover only for genuinely clickable cards.

### 29.4 Icons

- Use one icon family consistently.
- Default size 20–24 px; compact data controls may use 18 px.
- Pair unfamiliar icons with text.
- Use filled/outlined variation consistently for selected navigation.
- Decorative icons must be hidden from assistive technology.
- Do not use emoji as status icons in production controls.

---

## 30. Grid and Responsive Layout System

### 30.1 Page grid

- Maximum general content width: approximately 1440 px.
- Marketing reading content: narrower max widths per section.
- 12-column desktop grid, 8-column tablet grid, and 4-column mobile grid.
- Gutters: 16 px mobile, 24 px tablet, and 24–32 px desktop.
- Dense enterprise tables may use the full viewport within the admin shell.

### 30.2 Suggested breakpoints

- Compact: below 600 px.
- Mobile landscape/small tablet: 600–767 px.
- Tablet: 768–1023 px.
- Desktop: 1024–1439 px.
- Large desktop: 1440 px and above.

Breakpoints should respond to content failure, not only device names.

### 30.3 Responsive transformations

- Desktop sidebar becomes a navigation rail, drawer, or bottom navigation on smaller screens.
- Multi-column dashboards become a priority-ordered single column.
- Tables become horizontally scrollable with sticky key columns or transform into structured cards when appropriate.
- Filter sidebars become modal/drawer filters with an applied-count badge.
- Secondary page actions move into an overflow menu; primary action remains visible.
- Curriculum sidebar becomes a full-height drawer in the learning player.
- Course studio inspector becomes a bottom sheet or separate route on compact screens.
- Quiz navigation becomes a drawer while timer/autosave remain visible.

---

## 31. Application Shell Redesign

### 31.1 Public shell

- Slim announcement area only for important system/product information.
- Header with brand, Catalog, Learning Paths, For Business, search, and authentication actions.
- Search expands into a command-style panel with recent and suggested queries.
- Header becomes compact on scroll without abrupt movement.
- Mobile header uses a clear menu, search action, and sign-in action.
- Footer includes product, support, legal, accessibility, language, and social links.

### 31.2 Learner shell

- Desktop left navigation with logo, Dashboard, My Learning, Review, Calendar, Skills, Certificates, Messages, and expandable More.
- Utility area for organization context, search, notifications, help, and profile.
- Sidebar can collapse to an icon rail while preserving tooltips and keyboard use.
- Mobile bottom navigation contains the four most important destinations plus More.
- Current course may expose a temporary “Resume” item.

### 31.3 Instructor shell

- Separate teaching workspace identity from learner navigation.
- Primary destinations: Overview, Courses, Students, Assessments, Grading, Analytics, Live, and Resources.
- Course studio opens with course-level navigation and draft/published state.
- Persistent autosave status and Preview action.
- Context switcher allows moving between organizations/courses without losing work.

### 31.4 Admin shell

- Stable left navigation with platform/organization grouping.
- Visible tenant/environment context to reduce operational mistakes.
- Global entity search.
- Dense mode option for operations teams.
- Breadcrumbs and page-level action bar remain consistent.
- Destructive/system actions are visually separated from routine actions.

### 31.5 Focus shell

Lessons, quizzes, reviews, labs, and live sessions use a specialized shell:

- Minimal navigation.
- Clear exit behavior.
- Persistent task progress/status.
- Distraction-free content area.
- Access to help and accessibility controls.
- No marketing, unrelated recommendations, or noncritical announcements.

---

## 32. Core Component Redesign Specification

### 32.1 Buttons

- Primary: one per action group whenever possible.
- Secondary: bordered or soft neutral treatment.
- Tertiary: text/button treatment for low-emphasis actions.
- Destructive: rose treatment, never used as a general accent.
- Loading preserves button width and exposes a text status.
- Disabled controls must remain readable and explain why when the reason is not obvious.
- Minimum touch target 44 by 44 px.

### 32.2 Inputs and forms

- Labels remain visible above or within fields and never rely on placeholder text.
- Helper text explains format before an error occurs.
- Errors appear next to the field and in a top summary for long forms.
- Required and optional states use consistent language.
- Save status is visible for autosaved workflows.
- Multi-step forms expose current step, completed steps, and remaining work.
- Destructive reset/cancel actions cannot resemble forward progress.

### 32.3 Cards

- Cards are reserved for grouped, reusable, or clickable content.
- Clickable cards show clear hover/focus state and a semantic link target.
- Avoid nested cards.
- Course cards use consistent image ratio, title height strategy, metadata, progress, and action.
- Metric cards contain one primary number, label, period/context, and optional trend explanation.

### 32.4 Tables

- Sticky header for long lists.
- Sort state visible and announced.
- Row selection and bulk actions use a clear selected-count bar.
- Filters are reflected in the URL.
- Empty results distinguish no data from no filter match.
- Row actions use one primary inline action at most; remaining actions use a menu.
- Columns can be configured for enterprise users where useful.
- Provide CSV/export only with authorization and privacy safeguards.

### 32.5 Status indicators

Use stable combinations of label, icon, and color:

- Draft: neutral.
- In review: blue/information.
- Scheduled: indigo with date.
- Published/active: green or teal with explicit label.
- Needs attention: amber.
- Failed/blocked: rose.
- Archived: muted slate.

### 32.6 Empty states

Every empty state includes:

1. Clear title.
2. One-line explanation.
3. Primary next action where appropriate.
4. Optional secondary link to help.
5. Restrained illustration only when it improves understanding.

### 32.7 Loading

- Use skeletons for recognizable page structures.
- Use inline progress for local actions.
- Use determinate progress for uploads/processing where available.
- Avoid full-screen spinners after the application shell is loaded.
- Keep existing content visible during background refresh.

### 32.8 Errors

- Inline error for local component failure.
- Page error for route-critical failure.
- Toast only for transient confirmations or events that do not require persistent action.
- Preserve entered data whenever possible.
- Include retry, back, support, or reference ID according to context.

### 32.9 Charts

- Standardize on one primary chart library after capability/accessibility evaluation.
- Use direct labels where possible.
- Tooltips supplement rather than contain essential information.
- Provide a table or textual summary.
- Explain metric definitions and date ranges.
- Avoid 3D charts, decorative gauges, and overcrowded pie charts.
- Prefer line, bar, stacked bar, heatmap, and distribution charts according to the question being answered.

---

## 33. Public Website Redesign

### 33.1 Home page composition

The current home page should be completely restructured:

1. **Navigation header:** clean brand and clear primary paths.
2. **Hero:** outcome-oriented headline, short supporting text, prominent catalog search, primary “Explore courses” action, and secondary enterprise action.
3. **Trust strip:** organization logos, learner count, course count, satisfaction, or accreditation only when verified.
4. **Popular learning directions:** skill/category tiles using restrained icons and tints.
5. **Recommended/trending courses:** responsive grid, not an inaccessible mandatory carousel.
6. **Learning paths:** outcome-based journeys with time and skill metadata.
7. **How it works:** three concise steps for discovering, learning, and proving skills.
8. **Platform strengths:** adaptive support, practical learning, accessibility, and credible certificates.
9. **Instructor/organization section:** separate calls to teach and train teams.
10. **Testimonials/success stories:** authentic, concise, and non-auto-rotating.
11. **Final call to action:** focused invitation based on authentication state.
12. **Comprehensive footer.**

The hero image must support the content and may use a custom illustration/dashboard composition. Avoid generic stock photography that competes with search.

### 33.2 Catalog redesign

- Search field with query suggestions and keyboard navigation.
- Result count and active filter summary.
- Left filter panel on desktop; filter drawer on mobile.
- Sticky sort/view controls.
- Course grid using 3–4 columns depending on width.
- Pagination or accessible incremental loading; do not hide total navigation behind endless scrolling.
- Compare/save actions only if product research validates them.

### 33.3 Course card redesign

Each card contains:

- 16:9 image with meaningful alt behavior.
- Optional organization/category label.
- Two-line course title.
- Instructor/provider.
- Rating and review count if statistically meaningful.
- Level, duration, language, or delivery mode using concise metadata.
- Price/access state if applicable.
- Enrollment progress and Resume action for enrolled learners.
- Hover/focus state that does not move surrounding layout.

### 33.4 Course detail redesign

- Dark or softly branded hero with readable content and enrollment panel.
- Sticky desktop enrollment summary after the hero; mobile bottom action bar.
- Quick-facts row.
- Scannable tab/anchor navigation for Overview, Curriculum, Instructor, Reviews, and FAQs.
- Curriculum preview grouped by section with locked/free-preview state.
- Learning outcomes expressed as capabilities.
- Accessibility and content-format information shown before enrollment.
- Related content appears after essential details rather than interrupting them.

---

## 34. Learner Experience Redesign

### 34.1 Learner dashboard

The dashboard hierarchy should be personalized and action-oriented:

1. Calm greeting and date/context.
2. Main Continue Learning panel with progress, next activity, and estimated time.
3. Today panel containing due reviews, deadlines, and live sessions.
4. Recommended next steps with visible reasons.
5. Compact progress metrics rather than four equally loud cards.
6. Skill/mastery trend.
7. Recent feedback and notifications.
8. Achievements as a lower-priority optional section.

Do not overwhelm new learners with empty charts. Replace them with onboarding and discovery actions until meaningful data exists.

### 34.2 My Learning

- Prominent search and status tabs.
- Active courses displayed with progress and Resume action.
- Course card layout emphasizes next lesson and deadline rather than marketing metadata.
- Completed items expose certificate, review, and revisit actions.
- Organization assignments show source and due date clearly.

### 34.3 Learning player

- Curriculum navigation occupies approximately 300–360 px on large screens and can collapse.
- Main learning column maintains comfortable reading width for text but expands for media/labs.
- Course/section/lesson hierarchy is always understandable.
- Current activity and completion state are unmistakable.
- Bottom navigation keeps Previous, Complete/Continue, and Next in a consistent order.
- Notes, transcript, discussion, resources, and AI assistant use tabs/drawers without crowding content.
- Video controls are high contrast and fully keyboard operable.
- Reading progress and media watch progress are informative, not invasive.
- Celebration appears after meaningful section/course completion and respects reduced motion.

### 34.4 Quiz experience

- Pre-attempt page separates policy from the start action.
- Attempt header shows quiz name, timer, autosave, and Submit.
- Question body remains centered with sufficient width.
- Question navigation is visible on desktop and a drawer on mobile.
- Selected options have strong border, surface, and control state—not color alone.
- Timer becomes progressively noticeable only near defined thresholds; it must not flash.
- Autosave uses “Saving…”, “Saved”, and “Not saved—retrying” states.
- Final review highlights unanswered/flagged questions.
- Results prioritize learning feedback and recommended action over celebratory effects.

### 34.5 Daily review

- One-card focus experience.
- Progress is visible but secondary.
- Reveal transition is brief and optional.
- Response controls have color, icon, label, and keyboard shortcut.
- End summary focuses on retention and the next scheduled session.

### 34.6 Profile, skills, and certificates

- Profile uses clear public/private preview.
- Skill view provides graph and accessible list modes.
- Evidence drawers connect skills to courses, assessments, and artifacts.
- Certificate gallery is clean and formal; each credential has verification status and sharing controls.

---

## 35. Instructor Experience Redesign

### 35.1 Instructor dashboard

- Welcome/header with course context and Create Course action.
- Needs Attention queue for grading, failed uploads, unanswered questions, and publish issues.
- Operational metrics: active learners, engagement, pending grading, completion/mastery.
- Course health list with concise status and action.
- Upcoming live sessions and deadlines.
- Analytics summaries link to deeper views rather than showing many charts at once.

### 35.2 Course list

- Search, owner, status, category, date, and cohort filters.
- List/table view optimized for operational scanning.
- Course row includes title, status, learners, completion/mastery, last updated, and primary action.
- Drafts expose Continue editing; published courses expose View/Manage.
- Duplicate, archive, new version, and unpublish stay in the overflow menu.

### 35.3 Course studio

The current single multi-step component must become a professional workspace:

- Course title, status, autosave, preview, and publish actions in a persistent top bar.
- Left studio navigation: Setup, Curriculum, Assessments, Accessibility, Pricing/Access, and Settings.
- Curriculum center panel with sections and lessons.
- Contextual right inspector for selected item settings.
- Drag-and-drop plus keyboard reorder controls.
- Add-content menu with recognizable block types.
- Inline validation and a global readiness panel.
- Version/contributor status where collaborative editing is supported.
- Mobile authoring supports essential edits, while complex composition may recommend a larger display without blocking access.

### 35.4 Content editor

- Block-based canvas with clear insertion points.
- Context toolbar appears on selection and remains keyboard reachable.
- Media placeholders show upload/processing state.
- Preview modes for desktop/tablet/mobile and learner accommodations.
- Accessibility panel checks headings, alt text, captions, link labels, reading order, and contrast.

### 35.5 Assessment builder

- Left structure/navigation, central question canvas, right settings panel.
- Point total, validation, and publish readiness remain visible.
- Question type selector explains use cases.
- Random pools and fixed questions are visually distinct.
- Learner preview opens in an isolated focus view.

### 35.6 Grading workspace

- Submission list/queue on the left.
- Submission content in the center.
- Rubric and feedback on the right.
- Sticky Save draft and Return grade actions.
- Keyboard workflow for moving between submissions.
- Unsaved feedback is protected during navigation.

---

## 36. Administrator and Enterprise Experience Redesign

### 36.1 Admin dashboard

- Health and attention summary before analytics.
- Key metrics with date/tenant scope.
- Pending moderation, failed jobs, access issues, and expiring integrations.
- User/course trends use simple charts with accessible summaries.
- Recent privileged activity links to audit detail.

### 36.2 Management screens

- Query, filters, column settings, saved views, pagination, and export are standardized.
- Bulk actions appear only after selection.
- Detail opens as a route or wide drawer according to complexity.
- User detail shows identity, memberships, permissions, enrollment, sessions, and audit events in tabs.
- Course moderation shows preview and policy issues beside approve/reject controls.

### 36.3 Organization experience

- Organization switcher is visible but unobtrusive.
- Dashboard focuses on assignment compliance, activation, mastery, and seats.
- Member import has mapping, validation, preview, and resumable result reporting.
- Cohort builder uses a clear sequence: members, learning, schedule, notifications, review.
- Branding has constrained controls and live preview.
- SSO pages communicate setup status and safe diagnostic information without exposing secrets.

### 36.4 Enterprise density

- Comfortable density is default.
- Compact density may be chosen for table-heavy administration.
- Density changes spacing but never reduces target size below accessibility requirements.
- Saved table views and filter presets support repeat operational tasks.

---

## 37. Motion and Microinteraction System

### 37.1 Motion principles

- Motion explains state change, spatial relationship, progress, or success.
- Standard transitions: approximately 120–220 ms.
- Large panel transitions: up to approximately 300 ms.
- Use ease-out for entering and ease-in for leaving.
- Avoid spring/bounce motion in enterprise workflows.
- Reduced-motion mode removes transforms and uses instant/fade state changes.

### 37.2 Approved microinteractions

- Button press feedback.
- Navigation selected-state transition.
- Accordion and drawer continuity.
- Checkmark/progress update after completion.
- Skeleton-to-content fade without layout jump.
- Autosave status transition.
- Drag destination/reorder feedback.
- Restrained milestone celebration.

### 37.3 Prohibited motion

- Constant pulsing elements.
- Auto-rotating testimonials or course carousels.
- Confetti for routine actions.
- Shaking invalid forms.
- Flashing timer states.
- Parallax that impairs reading or performance.

---

## 38. Interaction and Feedback Rules

### 38.1 Hover, focus, pressed, and selected

Every interactive component must define all states:

- Default.
- Hover.
- Keyboard focus-visible.
- Pressed/active.
- Selected/current.
- Disabled.
- Loading.
- Error where applicable.

Focus and selected states must not be visually identical.

### 38.2 Optimistic interaction

Use optimistic UI for reversible, low-risk actions such as bookmark, reaction, and simple preference changes. Do not use unqualified optimistic completion for assessment submission, payment, enrollment, publishing, grading release, or destructive administration.

### 38.3 Undo

Offer timed Undo for reversible actions such as archive, remove from list, dismiss recommendation, or delete draft where server behavior permits. Use confirmation dialogs for irreversible or high-impact operations.

### 38.4 Notifications

- Toasts are short, nonblocking, and limited in number.
- Persistent issues use banners or inline panels.
- Notification center groups by Today/Earlier and supports read state.
- Critical system messages cannot be communicated only by toast.
- Respect notification and reduced-interruption preferences.

---

## 39. Illustration, Photography, and Data Visualization Art Direction

### 39.1 Illustration

- Use a consistent custom or licensed illustration family.
- Prefer simple geometric/line illustrations with brand and teal accents.
- Illustrations support onboarding, empty states, and milestones.
- Keep enterprise and error screens restrained.

### 39.2 Photography

- Use authentic, diverse, contextually relevant people and learning environments.
- Apply consistent crop, lighting, and treatment.
- Never place important text over visually busy areas without a tested overlay.
- Supply responsive sizes and correct alt behavior.

### 39.3 Course imagery

- Standard 16:9 ratio.
- Guidelines for title-free imagery to prevent tiny unreadable text.
- Placeholder system based on category/skill when no image exists.
- Instructor uploads are cropped/previewed and checked for minimum resolution.

### 39.4 Analytics palette

- Fixed semantic series palette across dashboards.
- The same concept retains the same color within a view.
- Risk/low performance is not shown as alarming red unless immediate action is required.
- Heatmaps include legends and non-color values.

---

## 40. Personalization Without Fragmentation

Users may control:

- Light, dark, or system theme.
- Comfortable or compact density where supported.
- Text size.
- Reduced motion.
- High contrast.
- Dyslexia-friendly typography mode after testing.
- Caption defaults and transcript preference.
- Playback speed.
- Dashboard widget ordering within constrained regions.
- Language and time zone.

Personalization must use shared tokens and supported configurations. It must not permit arbitrary page-builder layouts that become difficult to support or inaccessible.

---

## 41. Professional Accessibility Redesign

Accessibility is integrated into design files, acceptance criteria, and component APIs.

### 41.1 Design-stage annotations

Every screen specification identifies:

- Heading structure.
- Landmarks.
- Tab and focus order.
- Accessible names/descriptions.
- Live-region messages.
- Keyboard interactions.
- Focus entry/restoration behavior.
- Color contrast ratios.
- Zoom/reflow expectation.
- Reduced-motion behavior.
- Empty/loading/error announcements.

### 41.2 Critical workflow requirements

- Course curriculum can be operated without drag and drop.
- Matching and ordering questions have button/selection alternatives.
- Charts expose data tables.
- Rich-text editor provides semantic formatting controls.
- Media player works with keyboard and exposes captions/transcripts.
- Time-limited assessment announces time at non-disruptive thresholds and honors accommodations.
- AI streamed responses do not continuously overwhelm screen readers.
- Live-session chat and captions provide controlled announcement modes.

---

## 42. Figma and Design Deliverables

Before broad implementation, create a structured design workspace containing:

1. Product principles and visual mood board.
2. Foundations: color, typography, spacing, grid, radius, elevation, icons, and motion.
3. Variables/tokens for light, dark, high-contrast, density, and responsive modes.
4. Component library aligned with Angular components.
5. Component variants and all interaction states.
6. Page templates for public, learner, instructor, admin, and focus shells.
7. High-fidelity flows for the critical journeys.
8. Mobile, tablet, desktop, long-text, empty, loading, error, and permission states.
9. Prototypes for navigation, player, quiz, course studio, and grading.
10. Accessibility annotations.
11. Content/microcopy reference.
12. Developer handoff and implementation status.

### 42.1 Required high-fidelity journeys

- Public home ? catalog ? course detail ? enrollment.
- Login/MFA/session recovery.
- Learner dashboard ? resume lesson ? complete activity.
- Quiz overview ? attempt ? review ? results.
- Assignment ? upload ? submit ? feedback.
- Daily review session.
- Instructor dashboard ? create course ? curriculum ? preview ? publish.
- Assessment creation and grading.
- Admin user and course moderation.
- Organization cohort assignment.
- Offline/reconnect and API-error recovery.

### 42.2 Design review gates

- Product review: user value and scope.
- UX review: workflow, hierarchy, and state completeness.
- Visual review: consistency and polish.
- Accessibility review: WCAG and assistive interaction.
- Technical review: Angular feasibility, performance, API/state implications.
- Content review: language, terminology, and localization.

---

## 43. Angular Design-System Implementation Plan

### 43.1 Token implementation

- Store source design tokens in a maintainable token format.
- Generate or expose CSS custom properties for semantic roles.
- Map Angular Material theme roles to the same semantic tokens.
- Separate primitive tokens from semantic tokens and component tokens.
- Do not hardcode palette values inside feature component styles.

### 43.2 Shared component policy

- Wrap or compose Angular Material where the product requires consistent behavior.
- Do not rebuild accessible primitives without a clear reason.
- Keep shared APIs small, typed, and documented.
- Shared components include visual, keyboard, loading, empty, and error behavior where relevant.
- Build components in isolation with representative mock data.

### 43.3 Styling policy

- Prefer component-scoped styles and shared token/utilities.
- Avoid deep selectors and global overrides unless documented at the theme layer.
- Remove one-off margin/color utility proliferation.
- Use logical properties for RTL.
- Use container queries where they meaningfully improve reusable modules and browser support permits.
- Audit component style budgets and split large page styling into proper subcomponents.

### 43.4 Incremental redesign strategy

Do not mix old and new visual languages indefinitely.

1. Implement foundations and shells.
2. Implement shared components.
3. Redesign one complete vertical slice: home/catalog/course detail.
4. Validate user response and technical patterns.
5. Migrate learner dashboard/player/assessment.
6. Migrate instructor and admin workspaces.
7. Remove legacy style rules and duplicate Material overrides.

During migration, route-level visual boundaries may isolate legacy screens. New and old components should not be arbitrarily mixed on the same page.

---

## 44. UI Performance and Perceived Speed

The new design must feel fast even under enterprise data volume and moderate networks.

- Render the application shell immediately.
- Reserve media dimensions to avoid layout shifts.
- Use skeletons matching final layouts.
- Load the first useful dashboard/course content before secondary charts and recommendations.
- Defer editors, charts, PDF viewers, live features, and AI modules.
- Use responsive images with modern formats.
- Virtualize large curriculum trees, user lists, question banks, and audit logs.
- Debounce search and cancel stale requests.
- Preserve filters and loaded data during navigation when safe.
- Use optimistic feedback only under the rules above.
- Define measurable Core Web Vitals and route interaction budgets.

---

## 45. UX Research and Validation Plan

### 45.1 Research participants

- New learners.
- Returning/professional learners.
- Instructors and instructional designers.
- Graders.
- Platform and organization administrators.
- Users with keyboard-only, low-vision, and screen-reader needs.
- Enterprise training managers.

### 45.2 Validation rounds

1. Information architecture/card sorting.
2. Low-fidelity journey testing.
3. Visual-direction preference and trust testing.
4. High-fidelity usability testing.
5. Accessibility testing.
6. Beta telemetry and support feedback.

### 45.3 Core usability measures

- Time and success rate for finding/enrolling in a course.
- Resume-learning success.
- Assessment start/submission confidence.
- Instructor time to create and publish a valid course.
- Grading throughput and error rate.
- Admin time to find and safely update a user/course.
- System Usability Scale or equivalent benchmark.
- Accessibility task completion and severity of barriers.

### 45.4 Engagement quality measures

- Learners resuming recommended activities.
- Lesson and review completion.
- Return rate after useful notifications.
- Reduction in abandoned attempts and lost drafts.
- Instructor publication completion.
- Recommendation dismissal reasons.
- Satisfaction and perceived workload—not only time on site.

---

## 46. Detailed Visual QA Checklist

Each implemented screen must be reviewed for:

- Correct grid, alignment, and spacing.
- Typography hierarchy and line length.
- Color/token use and contrast.
- All interaction states.
- Mobile/tablet/desktop behavior.
- Long names, long translations, large numbers, and missing images.
- Empty, loading, partial, error, offline, permission, and stale-data states.
- Keyboard order and visible focus.
- Screen-reader naming and announcements.
- 200% and 400% zoom/reflow.
- Light, dark, high-contrast, and reduced-motion modes.
- No unexpected layout shift.
- Touch target sizes.
- Icons and imagery consistency.
- No clipped menus, dialogs, tooltips, or sticky elements.
- Print/download behavior for certificates, reports, and rubrics where required.

---

## 47. Redesigned UI Delivery Roadmap

### Design Phase D0 — Discovery and Visual Strategy

- Audit current screens, analytics, support issues, and competitor patterns.
- Interview representative users.
- Confirm brand constraints and enterprise use cases.
- Produce experience principles, mood board, and two or three visual direction samples.
- Select and accessibility-test the final direction.

### Design Phase D1 — Foundations and Core Components

- Finalize tokens, typography, grid, iconography, motion, and content voice.
- Design navigation shells.
- Build high-use controls, forms, cards, tables, status, feedback, and dialogs.
- Implement corresponding Angular design-system foundations.

### Design Phase D2 — Public and Learner Core

- Home, catalog, course detail, authentication, learner dashboard, My Learning, and player.
- Responsive prototypes and usability tests.
- Implement against mock gateways.

### Design Phase D3 — Assessments and Instructor Studio

- Quiz/assignment flows, results, course studio, content editor, question builder, and grading.
- Test long and failure-prone workflows with instructors/learners.

### Design Phase D4 — Enterprise and Analytics

- Admin shell, management tables, moderation, audit, organization dashboard, members, cohorts, and analytics.
- Validate density and efficiency with operational users.

### Design Phase D5 — Advanced Engagement

- Skills, review, certificates, gamification, discussions, live learning, AI, and labs.
- Apply the same calm system and avoid feature-specific visual fragmentation.

### Design Phase D6 — Accessibility and Production Polish

- Cross-product accessibility audit.
- Localization/RTL and long-text validation.
- Dark/high-contrast theme completion.
- Visual regression baselines.
- Performance and final interaction polish.

---

## 48. Revised Priority Screen List

The first production-quality redesign package should cover these screens before secondary features:

1. Public header/footer.
2. Home.
3. Catalog/search.
4. Course detail.
5. Login, registration, verification, and password recovery.
6. Learner shell and dashboard.
7. My Learning.
8. Learning player.
9. Assessment overview, attempt, review, and result.
10. Profile and settings.
11. Instructor shell and dashboard.
12. Course list and course studio.
13. Question/assessment builder.
14. Grading workspace.
15. Admin shell, dashboard, user management, and course moderation.
16. Shared 403, 404, empty, loading, error, offline, and maintenance states.

This set establishes the visual system across marketing, learning, content creation, data operations, and critical recovery states.

---

## 49. Final Professional UI Acceptance Criteria

The redesign is accepted only when:

- It is recognizably different from the existing frontend and not a minor theme update.
- Public, learner, instructor, and admin areas feel part of one product while serving different work modes.
- The color palette remains calm and readable during long sessions.
- Primary actions and page hierarchy are understandable within seconds.
- Engagement elements support learning goals and avoid manipulative patterns.
- The full experience works at mobile, tablet, desktop, and large desktop sizes.
- Core journeys pass representative usability testing.
- WCAG 2.2 AA requirements pass automated and manual evaluation.
- Light, dark, reduced-motion, and high-contrast experiences are deliberately designed.
- Every API-backed region has polished loading, empty, error, offline, and retry states.
- Enterprise tables and workflows remain efficient with realistic data volumes.
- Component implementation matches the documented design system and token usage.
- Visual regression and interaction tests protect the approved design.
- Backend-independent mock journeys and real backend integrations produce equivalent user experiences.

---

## 50. Immediate UI/UX Execution Order

1. Capture and score the existing UI against usability, accessibility, consistency, and responsive criteria.
2. Confirm brand constraints and select the Calm Momentum visual direction.
3. Create Figma variables and coded design tokens together.
4. Design and implement the public, learner, instructor, admin, and focus shells.
5. Build the shared component system with all states.
6. Redesign home, catalog, and course detail as the visual reference slice.
7. Validate the reference slice through responsive, accessibility, and user testing.
8. Redesign learner dashboard, My Learning, player, and assessments.
9. Redesign instructor course studio, assessment builder, and grading.
10. Redesign admin and organization operations for realistic enterprise volume.
11. Extend the approved system into skills, review, AI, collaboration, and labs.
12. Complete localization, dark/high-contrast themes, accessibility certification, visual regression, and production polish.

The result should be a distinctive, calm, credible learning platform that can attract new users, support sustained learning, and meet the practical demands of instructors and enterprise administrators without sacrificing accessibility or performance.
