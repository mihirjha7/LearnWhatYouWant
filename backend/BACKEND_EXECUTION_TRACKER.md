# Backend Execution Tracker

This tracker records implementation progress against `execution plan.md`. It must be updated whenever a backend task is completed or its status changes.

## Status legend

- `[x]` Completed and validated
- `[~]` In progress
- `[ ]` Not started
- `[!]` Blocked or requires a product/deployment decision

## Current implementation queue

1. Stabilize authentication, configuration, error handling, CORS, and persistence behavior.
2. Establish automated tests and application-layer boundaries.
3. Migrate controllers to DTO-backed application use cases.
4. Continue through domain expansion and platform capabilities in dependency order.

## Phase 0 — Discovery and stabilization

| Task | Status | Implementation / evidence |
|---|---|---|
| Audit current backend against critical blockers | [x] | Reviewed solution projects, API startup, JWT service, database context, configuration, and representative repository flow. |
| Add authentication middleware in the correct order | [x] | `UseAuthentication` now runs between CORS and authorization. |
| Remove duplicate dependency registrations | [x] | Duplicate enrollment and question repository registrations removed. |
| Consolidate JWT settings into strongly typed options | [x] | Added validated `JwtOptions`; token creation and bearer validation consume the same section. |
| Remove plaintext seeded administrator credentials | [x] | Removed model seed and added `Phase0SecurityAndSoftDeleteFilters` migration with conditional deletion of the known insecure seed. |
| Remove administrator plaintext-password authentication bypass | [x] | All users now use `PasswordHasher` verification. |
| Move CORS origins to configuration | [x] | Origins are loaded from `Cors:AllowedOrigins`; startup rejects an empty list. |
| Add global exception handling and ProblemDetails | [x] | Added `GlobalExceptionHandler`, `AddProblemDetails`, and exception-handler middleware. |
| Add EF Core global soft-delete query filters | [x] | Filters cover every entity with `IsDeleted` plus required dependent records. |
| Add health endpoint | [x] | `/health` smoke-tested with HTTP 200 (`Healthy`). |
| Remove entity cycle-suppression workaround | [ ] | Requires endpoint-by-endpoint DTO verification first to avoid breaking active contracts. |
| Add centralized DTO mapping | [ ] | Planned with the application-layer introduction. |
| Add application/service boundaries for all controllers | [~] | `AuthController`, `EnrollmentController`, and the profile/admin endpoints of `UserManagementController` use services. `MessagesController` and the instructor/student reporting endpoints remain. |
| Add FluentValidation pipeline | [x] | Automatic validation registered with validators for auth, enrollment, course, and category requests. |
| Add baseline unit/architecture tests | [x] | `tests/LMS.UnitTests` (10 passing) and `tests/LMS.ArchitectureTests` (4 passing). |
| Add integration tests | [ ] | Requires a disposable database; deferred to keep the local setup dependency-free. |
| Capture baseline security/performance/reliability metrics | [ ] | Not started. |

## Phase 1 — Application architecture

| Task | Status | Implementation / evidence |
|---|---|---|
| Result and error contracts | [x] | `Result`, `Result<T>`, and `Error` translated to `ProblemDetails` by `ResultExtensions`. |
| Current-user abstraction | [x] | `ICurrentUserService` / `HttpCurrentUserService` replaces unchecked `int.Parse` of claims. |
| Enrollment use cases | [x] | `EnrollmentService` enforces published-course and duplicate-enrollment rules and returns DTO projections. |
| Authentication use cases | [x] | `AuthService` centralizes login, registration, password reset, and duplicate-email checks. |
| User profile and admin use cases | [x] | `UserService` handles profile reads/updates, soft delete, profile pictures, and admin user management with DTO projections. |
| End-to-end API smoke tests | [x] | `scripts/api-smoke-test.ps1` runs 17 checks covering health, auth, validation, authorization, and enrollment rules. |
| API versioning | [x] | `Asp.Versioning` with URL segment and `X-Api-Version` header readers. |
| Rate limiting | [x] | Fixed-window limiter applied to `AuthController`. |
| Security headers | [x] | `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`. |
| Database resilience | [x] | `EnableRetryOnFailure` plus a database health check. |
| CQRS and pipeline behaviors | [ ] | Deferred until the remaining controllers are service-backed. |
| ASP.NET Core Identity migration | [ ] | Tracked as blocker B6. |

## Defects fixed

- `AuthController` used an email sender that was never injected, guaranteeing a `NullReferenceException` in forgot-password.
- `FindByResetTokenAsync` threw `NotImplementedException`, so password reset could never succeed.
- Password reset required an authenticated user, contradicting the forgotten-password flow.
- Forgot-password returned the reset token and revealed whether an account existed.
- Password reset hashed with a different hasher than login verification used.
- Registration did not check for duplicate emails.
- Enrollment allowed unpublished courses and returned entity graphs.
- `GET /api/UserManagement/me` used `int.Parse` on a claim, which could throw instead of returning 401.
- `GET /api/UserManagement/me/courses` returned the caller's own enrolled courses but was restricted to the `Admin` role, so students could never use it.
- `me/courses` returned 404 when a user simply had no enrollments; it now returns an empty list.
- Profile picture upload dereferenced a possibly null user and reported success even when the update failed.
- Admin user deletion and self-deletion left accounts active after a soft delete.

## Critical blocker status

| # | Blocker | Status |
|---|---|---|
| 1 | Authentication middleware missing | [x] |
| 2 | Duplicate DI registrations | [x] |
| 3 | Multiple/untyped JWT configuration access | [x] |
| 4 | Plaintext seeded administrator password | [x] |
| 5 | Entity serialization with cycle suppression | [ ] |
| 6 | Manual controller mapping | [ ] |
| 7 | Controllers directly use repositories | [~] Auth and enrollment migrated; user management and messages remain. |
| 8 | No global exception/validation pipeline | [x] Exception handling and FluentValidation are both in place. |
| 9 | Manual soft-delete filtering | [x] Global enforcement added; redundant repository predicates can be removed during cleanup. |
| 10 | Hardcoded CORS origin | [x] |
| 11 | Sequential database IDs exposed publicly | [ ] |

## Architecture and later phases

- [ ] Add `LMS.Application` with use cases, DTOs, validators, mappings, and result contracts.
- [ ] Introduce CQRS and pipeline behaviors.
- [ ] Add API versioning and resource-based authorization.
- [ ] Plan ASP.NET Core Identity migration, refresh-token rotation, MFA, and session revocation.
- [ ] Add modules/content blocks/course versions/learning paths.
- [ ] Expand assessment attempts, question banks, assignments, rubrics, and reviews.
- [ ] Add transactional outbox, workers, realtime, caching, search, and observability.
- [ ] Add skills, adaptive learning, spaced repetition, credentials, and analytics.
- [ ] Add enterprise tenancy, interoperability, accessibility, privacy, and operational hardening.

## Decisions and constraints

- The redesign is being delivered incrementally to keep the existing deployable backend buildable.
- Entity serialization cannot be disabled safely until every endpoint has a DTO contract.
- Public GUID/ULID migration requires additive database columns and backward-compatible API migration; it will not be performed as an unsafe primary-key replacement.
- Cloud-provider choices remain deferred until deployment constraints are confirmed.

## Validation log

- 2026-08-30: `dotnet build LMS.sln --no-restore --nologo` succeeded with no errors. Existing compiler/package warnings remain, including the MailKit security advisory.
- 2026-08-30: API startup smoke test succeeded; `GET /health` returned `200 Healthy`.
- 2026-08-30: EF migration scaffolding completed without global-query-filter relationship warnings.
- 2026-08-30: Full solution builds with 0 errors; 24 unit and architecture tests pass.
- 2026-08-30: All 17 API smoke tests passed against the live `OLMS_DB` database, before and after the user-management migration.
- 2026-08-30: Runtime check against the local `OLMS_DB` database returned `200 Healthy` for `/health` and `200` with data for `/api/CourseCategories`, with `X-Content-Type-Options: nosniff` present.
- Blockers are tracked in `BACKEND_BLOCKERS.md`.
