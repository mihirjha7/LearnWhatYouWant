# LMS Platform — Ultimate Redesign and Execution Plan

This plan is based on the current .NET 8 backend architecture: `LMS.API`, `LMS.Infrastructure`, and `LMS.Domain`, using ASP.NET Core Web API, Entity Framework Core, SQL Server, JWT authentication, and an Angular frontend.

## 0. Fix Critical Blockers First

These issues should be addressed before adding major features.

| # | Issue | Location | Required action |
|---|---|---|---|
| 1 | Authentication middleware is missing | `LMS.API/Program.cs` | Add `app.UseAuthentication()` before `app.UseAuthorization()` |
| 2 | Duplicate dependency registrations | `LMS.API/Program.cs` | Remove duplicate `IEnrollmentRepository` and `IQuestionRepository` registrations |
| 3 | Multiple JWT secret configuration sources | `LMS.API/Program.cs` | Consolidate them into strongly typed `JwtOptions` |
| 4 | Seeded administrator password is stored as plaintext | `LMS.Domain/LmsDbContext.cs` | Remove default credentials or seed a secure password hash |
| 5 | Entities can be serialized directly with cycle suppression | API configuration and controllers | Return DTOs rather than entities and remove reliance on `ReferenceHandler.IgnoreCycles` |
| 6 | Manual mapping is spread across controllers | API controllers | Introduce centralized mapping profiles using Mapster or AutoMapper |
| 7 | Controllers directly use repositories | API controllers | Enforce Controller ? Application/Service ? Repository flow |
| 8 | No global exception and validation pipeline | API layer | Add `IExceptionHandler`, `ProblemDetails`, and FluentValidation |
| 9 | Soft deletion is manually enforced | Repositories | Add EF Core global query filters |
| 10 | CORS origin is hardcoded | `LMS.API/Program.cs` | Move allowed origins into environment-specific configuration |
| 11 | Sequential database IDs are exposed publicly | Domain and API contracts | Introduce public GUID or ULID identifiers |

Correct middleware order:

```csharp
app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

---

## 1. Architectural Redesign

### 1.1 Target solution structure

```text
src/
??? LMS.Domain/                  # Entities, value objects, domain events, enums, exceptions
??? LMS.Application/             # CQRS handlers, DTOs, validators, interfaces, mappings
??? LMS.Infrastructure/          # EF Core, persistence, repositories, external integrations
??? LMS.Infrastructure.Identity/ # ASP.NET Core Identity, JWT, refresh tokens, 2FA
??? LMS.API/                     # Thin endpoints/controllers, middleware, filters
??? LMS.Workers/                 # Background jobs and event consumers
??? LMS.Realtime/                # SignalR hubs for notifications, chat, presence, live classes
??? LMS.Shared/                  # Shared contracts, result types, and constants

tests/
??? LMS.UnitTests/
??? LMS.IntegrationTests/
??? LMS.ArchitectureTests/
```

### 1.2 Core architecture changes

1. **Application layer:** Move orchestration and use cases out of controllers and infrastructure.
2. **CQRS:** Separate commands from queries using MediatR or equivalent request handlers.
3. **Result pattern:** Use `Result<T>` and structured errors for expected business failures.
4. **Specification pattern:** Create reusable query specifications instead of repository method proliferation.
5. **Domain events:** Publish events such as `CoursePublished`, `StudentEnrolled`, and `QuizCompleted`.
6. **Transactional outbox:** Save events with business data and dispatch them reliably from a worker.
7. **Global query filters:** Automatically exclude soft-deleted records and support tenant isolation.
8. **API versioning:** Expose routes such as `/api/v1/courses` using `Asp.Versioning.Mvc`.
9. **Identity:** Replace custom password and token handling with ASP.NET Core Identity.
10. **Resource-based authorization:** Verify whether an instructor owns or manages the requested course instead of relying only on role names.
11. **Thin controllers:** Controllers should validate transport concerns, send requests to the application layer, and translate results into HTTP responses.
12. **Modular monolith first:** Maintain one deployable backend while enforcing module boundaries. Extract microservices only when scaling or team ownership requires it.

---

## 2. Domain and Data Model Expansion

### 2.1 Course content

- Add `Module` or `Section` between `Course` and `Lesson`.
- Add `LessonContentBlock` for video, text, PDF, embed, H5P, SCORM, code, audio, and download content.
- Add ordering, draft/published states, release schedules, and prerequisite rules.
- Add `CourseVersion` so curriculum updates do not unexpectedly affect active learners.
- Add `LearningPath` for ordered collections of courses and completion requirements.
- Add lesson completion rules based on watch time, interactions, reading progress, or assessments.

### 2.2 Assessments

- Introduce question types: single-choice, multiple-choice, true/false, matching, ordering, fill-in-the-blank, short answer, essay, code challenge, and file upload.
- Add `QuestionBank`, tags, difficulty, learning objective, and reusable question pools.
- Replace score-only tracking with `QuizAttempt`, `AttemptAnswer`, snapshots, timing, and status.
- Add randomized questions and answer options.
- Add quiz availability windows, time limits, attempt limits, pass thresholds, and negative marking.
- Add `Assignment`, `Submission`, attachments, deadlines, late penalties, and resubmissions.
- Add `Rubric` and `RubricCriterion` for structured grading.
- Add peer review and instructor feedback workflows.

### 2.3 Skills and adaptive learning

- Add `Skill`, `SkillPrerequisite`, and course/lesson/question-to-skill mappings.
- Add `UserSkillMastery` with confidence, mastery value, evidence, and last verified time.
- Add mastery decay and retention calculations.
- Track why content was recommended, skipped, or assigned for remediation.

### 2.4 Engagement and gamification

- Add `Badge`, `Achievement`, `UserBadge`, `PointsLedger`, `Streak`, and scoped leaderboards.
- Add verifiable `Certificate` records and public verification pages.
- Add timestamped notes, bookmarks, highlights, reactions, and personal study lists.
- Replace flat comments with discussion threads, replies, reactions, moderation, and accepted answers.
- Add study groups, group membership, peer mentoring, and cohort challenges.

### 2.5 Enterprise and operations

- Add `Organization` or `Tenant` for B2B multi-tenancy.
- Add `Cohort` for scheduled course deliveries.
- Add `LiveSession`, attendance, recordings, and participation records.
- Add `Notification`, `NotificationPreference`, `AuditLog`, and configurable templates.
- Add `Order`, `Payment`, `Refund`, `Coupon`, `Invoice`, and `Subscription` if monetization is required.
- Add GDPR data export, consent, retention policies, anonymization, and account deletion workflows.

---

## 3. Signature Features

### 3.1 Adaptive learning engine

Build a skill-graph-driven engine that estimates learner mastery and dynamically recommends the next activity. It should:

- Detect weak prerequisite skills.
- Insert remediation lessons and practice questions.
- Skip content after demonstrated mastery.
- Adapt difficulty using assessment evidence.
- Explain every recommendation to the learner and instructor.
- Support rule-based recommendations first, followed by statistical models when sufficient data exists.

### 3.2 Spaced-repetition retention system

- Generate or curate flashcards from course content and missed questions.
- Schedule reviews using FSRS or SM-2.
- Send short daily review sessions.
- Track a retention score that changes over time.
- Revalidate skills after long periods of inactivity.
- Show instructors which concepts are being forgotten across a cohort.

### 3.3 AI teaching assistant grounded in course material

Implement Retrieval-Augmented Generation over approved course content:

- Index transcripts, PDFs, lessons, slides, FAQs, and discussions.
- Return citations linking to the source paragraph or video timestamp.
- Apply tenant and course-level access controls during retrieval.
- Use a Socratic mode during graded work rather than exposing direct answers.
- Record feedback, source quality, token use, and safety events.
- Require instructors to approve AI-generated quizzes and learning content.

### 3.4 Skill passport and verifiable credentials

- Provide a shareable learner skill profile.
- Issue Open Badges 3.0 or W3C Verifiable Credentials.
- Include assessment evidence and project artifacts.
- Add public verification and revocation endpoints.
- Allow learners to control profile visibility.

### 3.5 Content intelligence studio

- Automatic transcription, captions, translation, and chapter generation.
- Draft quiz and flashcard generation for instructor review.
- Video confusion heatmaps based on rewinds, pauses, abandonment, and questions.
- Assessment quality analytics, including difficulty and discrimination values.
- Accessibility checks for uploaded content.
- Duplicate and outdated content detection.

### 3.6 Live collaborative learning

- SignalR notifications, presence, messaging, and live activity updates.
- Shared whiteboard and synchronized video playback.
- Collaborative Monaco code editor backed by CRDT technology.
- Breakout rooms, polls, hand raising, attendance, and comprehension heatmaps.
- WebRTC for real-time audio/video or integration with Teams/Zoom.

### 3.7 In-browser practice environments

- Containerized code execution with CPU, memory, network, and time limits.
- Hidden and visible test cases for programming challenges.
- Browser SQL labs with disposable datasets.
- Python notebooks through Pyodide or isolated server-side runners.
- Lab snapshots, hints, progress persistence, and instructor analytics.

### 3.8 Early-warning analytics

- Detect disengagement using inactivity, missed deadlines, low mastery, and session trends.
- Provide explainable risk factors instead of an unexplained score.
- Trigger configurable nudges or instructor interventions.
- Measure whether interventions improved outcomes.
- Avoid punitive automated decisions and provide human review.

### 3.9 Accessibility and inclusion

- Target WCAG 2.2 AA.
- Full keyboard navigation and visible focus handling.
- Screen-reader-friendly lessons and assessments.
- Captions, transcripts, audio descriptions, and playback speed controls.
- Dyslexia-friendly display mode, text resizing, contrast modes, and reduced motion.
- Localization, translated subtitles, and right-to-left language support.

### 3.10 Additional differentiators

- Offline-capable mobile-first PWA.
- Downloadable lessons and offline assessment synchronization.
- Microlearning mode that creates short daily learning sessions.
- Career-role maps showing missing skills for target job roles.
- Peer mentorship matching based on compatible skill profiles.
- Voice navigation and podcast-style audio lesson mode.
- Public API, webhooks, LTI 1.3, SCORM, and xAPI interoperability.

---

## 4. Platform and Technology Upgrades

| Concern | Current state | Target state |
|---|---|---|
| Authentication | Custom password/JWT services | ASP.NET Core Identity, access tokens, refresh-token rotation, revocation, TOTP 2FA, OAuth/OIDC |
| Authorization | Role attributes | Policy and resource-based authorization with ownership checks |
| File storage | Local file upload | Object storage, direct uploads, signed URLs, CDN, malware scanning |
| Video | Raw files or URLs | HLS adaptive streaming, signed playback, thumbnails, captions, transcoding |
| Caching | None | Redis distributed cache, output caching, distributed locks, leaderboards |
| Search | Database filtering | Full-text, semantic, and vector hybrid search |
| Realtime | None | SignalR for notifications, chat, presence, and live activities |
| Jobs | None | Hangfire, Quartz, or cloud workers for email, certificates, analytics, and media processing |
| Messaging | None | Reliable broker plus transactional outbox |
| Observability | Limited | OpenTelemetry, structured logging, traces, metrics, dashboards, alerts |
| Secrets | Configuration files | Managed secret store and workload identity |
| Rate limiting | None | .NET rate limiter with endpoint, user, tenant, and IP policies |
| API documentation | Swagger | Versioned OpenAPI with examples and an improved documentation UI |
| Database | SQL Server | SQL Server with tuned indexes, Redis, search/vector service, and analytics storage |
| Deployment | Manual or unspecified | Containers, automated CI/CD, safe database migrations, rollback, blue-green deployment |

### Cloud note

Select cloud services only after confirming deployment constraints, expected traffic, budget, compliance requirements, and data residency. Keep application interfaces provider-neutral where practical.

---

## 5. API Design Standards

- Use versioned REST endpoints and consistent resource naming.
- Return RFC 9457 `ProblemDetails` for failures.
- Require pagination on every collection endpoint.
- Support filtering, sorting, and field selection with explicit allowlists.
- Use idempotency keys for enrollment, payment, submission, and certificate operations.
- Add ETags or concurrency tokens for sensitive updates.
- Use `DateTimeOffset` in UTC for persisted and API timestamps.
- Use `decimal` for monetary values.
- Do not expose domain entities from endpoints.
- Publish OpenAPI descriptions, examples, error contracts, and deprecation policy.
- Add webhooks with signatures, retry delivery, replay protection, and delivery logs.

---

## 6. Security and Privacy

1. Follow OWASP ASVS and OWASP API Security guidance.
2. Use secure password hashing through ASP.NET Core Identity.
3. Rotate refresh tokens and detect token reuse.
4. Add MFA, account lockout, password reset, email verification, and active-session management.
5. Add rate limiting and bot protection to authentication endpoints.
6. Store secrets outside source control.
7. Encrypt sensitive data in transit and at rest.
8. Validate and scan all uploads; never trust file names or MIME headers.
9. Add audit trails for privileged and grading actions.
10. Add consent and retention controls for AI and proctoring data.
11. Use security headers, strict CORS, CSP, and safe proxy configuration.
12. Perform threat modeling and penetration testing before production launch.
13. Add dependency, container, secret, and static analysis scanning in CI.
14. Define incident response, backup, restore, and disaster recovery procedures.

---

## 7. Quality, Testing, and Performance

### Testing strategy

- Unit tests for domain rules and application handlers.
- Integration tests using `WebApplicationFactory` and Testcontainers.
- Contract tests for public APIs and webhooks.
- Architecture tests that enforce dependency boundaries.
- Playwright end-to-end tests for critical frontend workflows.
- Load tests for login, course browsing, video events, quizzes, and live sessions.
- Accessibility testing with automated checks and manual keyboard/screen-reader review.

### Performance standards

- Establish p50, p95, and p99 latency objectives.
- Use `AsNoTracking` for read-only EF Core queries.
- Project directly to DTOs and avoid N+1 queries.
- Require indexed filtering and bounded pagination.
- Cache only measured hot paths and define invalidation rules.
- Process media, notifications, certificates, and analytics asynchronously.
- Use CDN delivery for public assets and streaming media.

### Operational readiness

- Health, readiness, and liveness endpoints.
- Correlation IDs across HTTP, jobs, and messages.
- Structured logs without passwords, tokens, or unnecessary PII.
- Distributed traces and service-level dashboards.
- Error budget and alerting policies.
- Tested backup restoration and migration rollback procedures.

---

## 8. Delivery Roadmap

### Phase 0 — Discovery and stabilization (1–2 weeks)

- Confirm product goals, users, deployment model, budget, and compliance needs.
- Document existing endpoints, entities, migrations, and known defects.
- Fix authentication middleware, DI duplicates, JWT configuration, and seeded credentials.
- Add global exceptions, validation, structured logging, health checks, and baseline tests.
- Capture baseline security, performance, and reliability metrics.

### Phase 1 — Application architecture (4–6 weeks)

- Add `LMS.Application` and move DTOs/use cases into it.
- Introduce command/query handlers and pipeline validation.
- Standardize result and error contracts.
- Add centralized mapping and API versioning.
- Introduce ASP.NET Core Identity, refresh tokens, MFA-ready flows, and resource authorization.
- Add architecture and integration tests.

### Phase 2 — Core learning model (4–6 weeks)

- Introduce modules, content blocks, prerequisites, course versions, and learning paths.
- Add full quiz attempts, question banks, assignment submissions, rubrics, and reviews.
- Add progress rules, certificates, notifications, discussions, and audit logs.
- Implement safe data migration and backward-compatible API transitions.

### Phase 3 — Platform services (4–6 weeks)

- Move files to object storage and add media processing.
- Add Redis, SignalR, background jobs, search, event messaging, and the outbox.
- Add OpenTelemetry and production dashboards.
- Containerize services and establish CI/CD and environment promotion.

### Phase 4 — Signature learning features (6–8 weeks)

- Implement skill graph and learner mastery records.
- Release rule-based adaptive recommendations.
- Add spaced repetition and retention dashboards.
- Add skill passport, evidence-backed certificates, gamification, and cohort analytics.

### Phase 5 — AI and advanced practice (6–8 weeks)

- Add grounded AI assistant with citations and access-controlled retrieval.
- Add instructor content intelligence and quiz drafting.
- Release isolated code/SQL practice environments.
- Add explainable early-warning analytics and intervention workflows.

### Phase 6 — Enterprise scale and reach (4–6 weeks)

- Add organization multi-tenancy, tenant administration, SSO, and delegated roles.
- Add PWA offline support, internationalization, and WCAG 2.2 AA hardening.
- Add public APIs, webhooks, LTI 1.3, SCORM, and xAPI.
- Complete load, security, privacy, backup, and disaster recovery certification.

---

## 9. Recommended Team Structure

- Product manager or product owner.
- Solution architect or senior backend lead.
- Two or more .NET backend engineers.
- Two Angular/frontend engineers.
- UX/UI designer with accessibility expertise.
- QA automation engineer.
- DevOps/platform engineer.
- Data/ML engineer for recommendations and analytics.
- Security/privacy reviewer for identity, AI, and proctoring.
- Instructional designer to verify that adaptive and AI features improve learning.

---

## 10. Product Metrics

### Learning outcomes

- Skill mastery gain.
- Retention after 7, 30, and 90 days.
- Assessment improvement between attempts.
- Time to demonstrated proficiency.
- Remediation success rate.

### Engagement

- Activation rate after enrollment.
- Weekly active learners.
- Lesson and learning-path completion.
- Daily review participation.
- Discussion and live-session participation.

### Platform health

- API latency and error rate.
- Job and message failure rate.
- Search quality and AI citation acceptance.
- Video startup and buffering rates.
- Accessibility defect count.

### Business

- Trial-to-paid conversion.
- Course and subscription revenue.
- Learner retention and churn.
- Organization renewal rate.
- Support requests per active learner.

Do not use course completion alone as the primary success metric; prioritize verified mastery and long-term retention.

---

## 11. Prioritization Rules

Every proposed feature should be evaluated against:

1. Does it improve a measurable learner outcome?
2. Is it secure, accessible, and privacy-preserving?
3. Can it be implemented and operated reliably?
4. Does it create a meaningful market differentiator?
5. Is the value greater than its development and operational cost?
6. Can it be delivered incrementally behind a feature flag?

Avoid prematurely adopting microservices, machine learning, blockchain, or complex cloud infrastructure without a validated requirement and measurable benefit.

---

## 12. Immediate Execution Order

1. Correct middleware order and configuration defects.
2. Secure administrator initialization and authentication.
3. Add global exception handling, validation, logging, and tests.
4. Establish the application layer and migrate one course workflow as the reference pattern.
5. Standardize authorization, DTO mapping, pagination, soft delete, and audit fields.
6. Design modules, quiz attempts, assignments, skill graph, and mastery data models.
7. Build the skill graph and spaced-repetition foundation before AI recommendations.
8. Introduce object storage, jobs, events, Redis, search, and observability.
9. Add grounded AI and advanced collaboration only after access control, data quality, and monitoring are mature.

The recommended starting sequence is: stabilize the current backend, establish clean application boundaries, expand the core learning model, then build the adaptive and AI differentiation layers.