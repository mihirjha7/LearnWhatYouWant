# LMS UI Implementation Progress

Last updated: 2026-10-14

This file is the execution record for `../executionplanfor UI.md`. It is updated whenever a task is completed or its status changes.

## Status Key

- `[x]` Complete and validated
- `[~]` In progress
- `[ ]` Not started
- `[B]` Blocked; see `UI_BLOCKERS.md`

## Current Milestone: UI-0 / UI-1 Foundation

- `[x]` Audit the execution plan, Angular version, scripts, route table, app shell, and global theme entry points.
- `[x]` Create persistent implementation-progress and blocker tracking files.
- `[x]` Consolidate semantic design tokens, locally bundled typography, light/dark themes, focus styles, reduced motion, and responsive foundations.
- `[x]` Remove remote font/icon dependencies from the root shell. Material Icons now bundled via `@fontsource/material-icons`.
- `[x]` Remove duplicate profile/root routes and add dedicated accessible 403, 404, and maintenance states. Offline and generic runtime states remain under error infrastructure.
- `[x]` Lazy-load all public and role route components. Initial production bundle reduced from 1.67 MB to 633 KB.
- `[x]` Add portable runtime configuration through non-secret `public/app-config.json` with legacy API fallback and feature flags.
- `[x]` Normalize JWT claims into `SessionUser`, centralize the legacy token key, reject expired/malformed tokens, and support permission-aware guards.
- `[x]` Restrict authorization and correlation headers to the configured API origin; parse RFC 9457 errors and announce actionable global notifications.
- `[x]` Remove duplicate manual authorization headers and migrate all services/components to centralized API/upload URL construction.
- `[x]` Establish typed gateway contracts, deterministic mock fixtures, and feature flags. Assessment, learning-activity, instructor, admin/organization, and live/lab gateways bind to mocks through `provideGateways()`; a `featureFlagGuard` gates flagged routes.
- `[x]` Build shared buttons, badges, progress, empty/error states, skeletons, filters, and responsive tables (`shared/ui/primitives.ts` + global `shared/ui/workspace.css`).
- `[x]` Online/offline banner and development-only role preview sign-in for mock-mode review.
- `[x]` Build redesigned public and shared role-aware workspace shells with desktop rail, mobile drawer, bottom navigation, and focus-route chrome suppression.

## Planned Vertical Slices

- `[x]` Redesign public home, URL-driven catalog/search, typed course detail, deterministic learning paths, and idempotent enrollment UI with mock/legacy adapters.
- `[x]` Redesign authentication, recovery, verification, MFA, and session-security screens. Active-session management lives in learner settings.
- `[x]` Learner dashboard, My Learning, player, notes, review, skills, certificates, settings, and public credential verification. Lesson notes sync into the Notes library.
- `[x]` Resumable assessments (all ten question renderers, autosave with retry, local recovery, server-aligned timer, navigator, flag/review, idempotent submit), persisted results, assignments with draft autosave, file validation, rubric, and feedback.
- `[x]` Instructor overview, course studio (setup, curriculum with keyboard reorder/undo, inspector, accessibility review, readiness checklist, publish/schedule/review, concurrency conflict handling), question bank with bulk actions, assessment builder, grading workspace, and analytics with intervention workflow.
- `[x]` Admin operations overview, roles, moderation, organizations, audit log, integrations, jobs, system health, and feature flags; organization workspace (dashboard, members, cohorts, branding with contrast enforcement, SSO).
- `[x]` Notifications, discussions, calendar, messaging, achievements, and offline states.
- `[x]` Feature-flagged live learning, practice labs, and enterprise experiences (mock only).
- `[-]` AI assistant and content intelligence: skipped by request.
- `[x]` Privacy, terms, and accessibility statement pages; `/teach/...` and `/learn/...` redirects.

## Quality Gates

- `[x]` Production compilation passes with no budget errors. Oversized legacy stylesheets were split per component; several still exceed the 4 kB warning, and the initial bundle (533 kB) exceeds the 500 kB warning.
- `[x]` Critical unit tests pass (`npm run test:ci`, 15 specs: attempt utilities, mock grading/idempotency, contrast/email/reorder utilities, Problem Details parsing, legacy quiz components).
- `[ ]` Keyboard navigation, visible focus, landmarks, labels, contrast, reduced motion, and 400% zoom are checked manually.
- `[ ]` Mobile, tablet, desktop, dark theme, and long-content layouts are checked.
- `[ ]` Playwright E2E and axe harnesses (not installed).
- `[ ]` Final route and bundle review passes with no unresolved critical blockers.
