# LMS UI Blockers and Decisions

Last updated: 2026-10-14

No local-machine or security blocker is currently preventing frontend implementation. One package was added: `@fontsource/material-icons` (local icon font).

## External Decisions

These items do not block mock-first UI work. They do block production integration or final policy behavior and will remain behind configuration or feature flags.

| ID | Decision or dependency | Affected work | Current handling |
|---|---|---|---|
| BLK-001 | Final brand identity and approved typeface | Final visual approval | Implementing the plan's Calm Momentum direction with the already-installed local Poppins package. |
| BLK-002 | Target `/api/v1` OpenAPI contracts and examples | Target API adapters and contract tests | Preserve current services; build typed frontend contracts and mocks without fabricating production endpoints. |
| BLK-003 | Instructor registration policy | Registration and permission elevation | Preserve the existing route while presenting it as a policy-controlled flow. |
| BLK-004 | Commerce and enrollment policy | Purchase, subscription, and organization-assigned states | Use feature flags and mock display states; do not implement payment handling without approved contracts. |
| BLK-005 | AI, live-provider, lab-runtime, and offline-assessment policies | Advanced UI-6/UI-7 integrations | Build non-secret mock experiences only; keep integrations disabled by default. |
| BLK-006 | Supported locales, RTL set, and organization branding limits | Localization acceptance and tenant theming | Build layout-safe foundations and controlled theme tokens pending final values. |
| BLK-007 | Backend contracts for assessments, assignments, discussions, studio, grading, admin console, organizations, live, and labs | Replacing mock gateways | All bound to mocks in `data-access/gateway.providers.ts`; legacy calls in older screens fail without the API running. |
| BLK-008 | Playwright/axe tooling approval | E2E and automated accessibility gates | Not installed; unit tests only. |

The local `public/app-config.json` enables `liveLearning`, `labs`, and `enterprise` for preview. Disable them before deploying. AI assistant work was skipped by request (`aiAssistant: false`).

## Resolved Blockers

None yet.
