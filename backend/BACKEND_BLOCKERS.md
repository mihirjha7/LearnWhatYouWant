# Backend Blockers

Blockers found while executing `execution plan.md`. Each entry records the impact and what is required to unblock it. Work continues on unblocked items.

## B1 — Password reset is non-functional

- **Impact:** High. `POST /api/auth/forgotPassword` and `POST /api/auth/resetPassword` could never succeed.
- **Cause:** `UserManagementRepository.FindByResetTokenAsync` threw `NotImplementedException`, `AuthController._email` was never injected (guaranteed `NullReferenceException`), the reset endpoint required an authenticated user, and reset used a different password hasher than login verification.
- **Status:** Resolved. `AuthService` now owns the flow, the endpoint is anonymous, token lookup is implemented, hashing is consistent, and the response no longer reveals whether an account exists. Verified by smoke tests.
- **Remaining:** Reset tokens are still stored in plaintext. Hashed, explicitly single-use tokens should come with the ASP.NET Core Identity migration (B6).

## B2 — SMTP credentials and email delivery are not configured

- **Impact:** Medium. Password reset emails cannot be delivered.
- **Cause:** Email settings are not present in configuration.
- **Required:** Provide SMTP host, port, sender, and credentials through user secrets or environment variables. Never commit real credentials.

## B3 — Sequential integer identifiers are exposed publicly

- **Impact:** Medium. Enumeration risk on course, quiz, and user endpoints.
- **Cause:** Primary keys are `int` and used directly in routes.
- **Required:** Additive `PublicId` (GUID) columns, backfill, dual-read APIs, then client migration. This is a multi-step migration and must not be done as an in-place key replacement.

## B4 — Entity graphs are still serialized with cycle suppression

- **Impact:** Medium. Risk of over-posting and leaking internal fields such as `PasswordHash`.
- **Cause:** Several endpoints return EF entities and rely on `ReferenceHandler.IgnoreCycles`.
- **Required:** Endpoint-by-endpoint DTO projection before the cycle-suppression setting can be removed safely.

## B5 — Repositories are used directly by controllers

- **Impact:** Medium. Business rules live in controllers.
- **Status:** `AuthController`, `EnrollmentController`, and the profile/admin endpoints of `UserManagementController` now use application services.
- **Remaining:** `MessagesController`, plus the instructor analytics and student dashboard endpoints, still call repositories directly.

## B6 — Custom identity implementation

- **Impact:** High for security roadmap.
- **Cause:** Passwords, tokens, and lockout are hand-rolled; no refresh tokens, MFA, email confirmation, or revocation.
- **Required:** ASP.NET Core Identity migration with a password-hash compatibility strategy. Large, breaking, and needs a planned rollout.

## B7 — Infrastructure-dependent features are out of scope for a local-only setup

- **Impact:** Informational.
- **Details:** Redis, object storage, message brokers, search/vector services, containerized code execution, and cloud observability from the plan cannot be enabled without external services.
- **Decision:** The backend remains runnable with only SQL Server (`OLMS_DB`) locally. These features must stay behind configuration so no local dependency is required.

## B8 — No automated test coverage existed

- **Impact:** High. Refactoring risk.
- **Status:** Resolved for the current scope. `tests/LMS.UnitTests` (19 tests), `tests/LMS.ArchitectureTests` (5 tests), and `scripts/api-smoke-test.ps1` (17 end-to-end checks) all pass.
- **Remaining:** Integration tests against a disposable database are still missing (see B7).

## B9 — Vulnerable dependency

- **Impact:** Medium. `MailKit 4.13.0` reports a known moderate-severity advisory (NU1902).
- **Required:** Upgrade after verifying email-sending behavior still works.
