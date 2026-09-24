# Implementation Plan: Manage Astrology Content

**Branch**: `001-manage-astrology-content` | **Date**: 2026-09-24 | **Spec**:
[spec.md](spec.md)

**Input**: Feature specification from `/specs/001-manage-astrology-content/spec.md`

## Summary

Build a Nuxt 4.5.2 static web application deployed to GitHub Pages. Visitors browse only active
astrology topics and content; the designated administrator signs in to create, edit, activate, and
deactivate records. Supabase supplies browser authentication and a hosted PostgreSQL database with
row-level security, while GitHub Pages serves the generated public application.

## Technical Context

**Language/Version**: TypeScript; Node.js 20 LTS or later; Nuxt 4.5.2

**Primary Dependencies**: Nuxt 4.5.2, Vue, `@supabase/supabase-js`, a Markdown renderer, and an
HTML sanitizer

**Storage**: Supabase-hosted PostgreSQL for topics, content items, and administrator allow-list

**Testing**: Vitest for unit and component tests, Playwright for end-to-end flows, Supabase
database tests for access policies

**Target Platform**: Modern evergreen browsers; GitHub Pages static hosting; GitHub Actions build
and deploy workflow

**Project Type**: Static web application with external managed authentication and data service

**Performance Goals**: Visitors see an active topic's content or a clear empty state within two
seconds on a typical broadband connection; administrators complete a topic or content save within
three seconds excluding network outages.

**Constraints**: Static-only hosting; repository deployment path must be supported; no service-role
credential or secret may be included in browser code or repository; backend authorization must not
depend on hidden user-interface controls; public content is intentionally internet-visible; rendered
Markdown MUST be sanitized before insertion into the page.

**Scale/Scope**: One administrator role shared by two configured administrator accounts; tens of
topics and hundreds of written content items for the initial release; no visitor accounts,
exclusive-content access controls, comments, media library, subscriptions, commerce, payment
processing, or personalized readings. Visitor accounts, exclusive content, and a purchasable
customized-reading catalog are documented future features, not initial-release requirements.

## Constitution Check

| Principle | Plan response | Status |
|-----------|---------------|--------|
| Requirements Traceability | Each design element maps to FR-001 through FR-010 and the specified acceptance scenarios. | Pass |
| Testable Behavior | Unit, end-to-end, and database-policy tests cover public visibility, sign-in, validation, and denied writes. | Pass |
| Small, Cohesive Changes | A single Nuxt application and one managed backend are used; no custom server is added. | Pass |
| Explicit Failure Handling | Data-load, validation, authorization, sign-out, and available session-expiry failures receive actionable user messages. Free-plan session controls are documented as unavailable. | Pass |
| Reviewable Quality Gates | Formatting, linting, type checks, targeted tests, build, and deployment smoke checks are required before completion. | Pass |
| Quality Constraints | Publishable connection values are supplied at build time; privileged credentials are never exposed; Pages publication is reviewed for public-data suitability. | Pass |

**Pre-design result**: Pass. The static-hosting constraint rules out server-side administrator
endpoints. Managed authentication plus database-level authorization is required to preserve the
security requirements.

## Project Structure

### Documentation (this feature)

```text
specs/001-manage-astrology-content/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── application-access.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── components/
│   ├── content/
│   └── admin/
├── composables/
├── layouts/
├── middleware/
├── pages/
│   ├── topics/
│   └── admin/
├── plugins/
├── types/
└── utils/

public/
supabase/
├── migrations/
└── tests/

tests/
├── unit/
├── component/
├── e2e/
└── integration/

.github/workflows/
└── deploy-pages.yml
```

**Structure Decision**: Use Nuxt's conventional single-application structure. Database migrations
and authorization-policy tests live with the application because the static site directly consumes
the managed backend. A single GitHub Actions workflow builds and deploys the static artifact.

## Complexity Tracking

No constitution violations require justification.

## Post-Design Constitution Check

The selected static Nuxt application, managed identity/data service, RLS policy tests, and GitHub
Pages workflow retain all pre-design gate results. The design adds no untracked complexity and
keeps privileged credentials out of client and deployment artifacts.
