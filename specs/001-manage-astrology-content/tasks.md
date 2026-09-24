---

description: "Implementation tasks for Manage Astrology Content"
---

# Tasks: Manage Astrology Content

**Input**: Design documents from `/specs/001-manage-astrology-content/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/application-access.md`, and `quickstart.md`

**Tests**: Tests are required by the project constitution. Write each listed test before its
implementation task and verify it fails for the intended reason first.

**Organization**: Tasks are grouped by user story so each story is independently deliverable once
the shared foundation is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with tasks that modify different files and have no unmet dependency.
- **[Story]**: Maps the task to its user story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Nuxt project, developer tools, and static deployment configuration.

- [x] T001 Initialize the Nuxt 4.5.2 TypeScript project and npm scripts in `package.json`
- [x] T002 [P] Configure Nuxt static output, `/astro/` base URL, and public runtime variables in `nuxt.config.ts`
- [x] T003 [P] Configure TypeScript, ESLint, Prettier, Vitest, and Playwright in `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`, `vitest.config.ts`, and `playwright.config.ts`
- [x] T004 [P] Add Supabase URL and publishable-key placeholders only, plus an environment template, in `.env.example` and `.gitignore`
- [x] T005 [P] Add the GitHub Pages build-and-deploy workflow with least-required Pages permissions in `.github/workflows/deploy-pages.yml`
- [x] T006 Create base Nuxt app assets and the shared public layout in `app/app.vue`, `app/layouts/default.vue`, and `app/assets/css/main.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish data structure, data-boundary authorization, shared client services, and
reusable error handling. No user-story implementation starts until this phase is complete.

- [x] T007 Create the initial Supabase migration for `administrator_profiles`, `topics`, and `content_items` in `supabase/migrations/0001_initial_schema.sql`; enforce the quoted constraints: Topic `name` is “Required; trimmed, non-empty, unique display name,” Topic `slug` is “Required; unique URL-safe identifier,” Content `title` is “Required; trimmed and non-empty,” Content `slug` is “Required; unique URL-safe identifier,” Content `body` is “Required; non-empty Markdown source content,” and each `is_active` “defaults to inactive”
- [x] T008 Create row-level security policies and least-privilege grants in `supabase/migrations/0002_access_policies.sql`: visitors read active topics only; visitors read content only when both item and topic are active; only allow-listed administrators can read all records or create/update topics and content; no client role can delete records
- [x] T009 [P] Write allow/deny database-policy tests for visitor, authenticated non-administrator, and administrator access in `supabase/tests/content_access_rls.test.sql`
- [x] T010 [P] Define shared Topic, ContentItem, AdministratorProfile, and form-input types in `app/types/content.ts`
- [x] T011 [P] Create the browser Supabase client from public runtime configuration in `app/composables/useSupabase.ts`
- [x] T012 [P] Create shared data-load, empty-state, and retryable-error components in `app/components/content/ContentState.vue` and `app/components/content/ContentError.vue`
- [x] T013 Implement topic/content input normalization, required-field validation, and URL-safe slug validation in `app/utils/contentValidation.ts`
- [ ] T014 Create a shared data-access composable with explicit error results in `app/composables/useContentRepository.ts`
- [ ] T015 [P] Implement Markdown-to-sanitized-HTML rendering with raw HTML disabled in `app/utils/renderMarkdown.ts`
- [ ] T016 Configure Supabase redirect URLs and the two-account administrator allow-list outside the repository; configure session lifetime and inactivity timeout when the plan supports them, otherwise record the Free-plan limitation in `supabase/README.md`
- [ ] T017 Run the schema migration and database-policy tests documented in `supabase/README.md` before starting user-story work

**Checkpoint**: Foundation ready. Database authorization—not UI visibility—now protects all
content and management mutations.

---

## Phase 3: User Story 1 - Browse Published Astrology Content (Priority: P1) 🎯 MVP

**Goal**: Visitors can browse active topics and read only content that is currently public.

**Independent Test**: Seed one active topic with active and inactive content, then browse its topic
and content paths signed out; active content appears, inactive content never appears, and an empty
topic shows a clear empty state.

- [ ] T018 [P] [US1] Write repository tests for active topic and active-content queries, including empty and failed loads, in `tests/unit/useContentRepository.spec.ts`
- [ ] T019 [P] [US1] Write component tests for loading, empty, error, topic-list, sanitized Markdown rendering, and content-summary states in `tests/component/publicContent.spec.ts`
- [ ] T020 [P] [US1] Write signed-out end-to-end coverage for active browsing, inactive direct links, an empty topic, and Markdown rendering in `tests/e2e/public-content.spec.ts`
- [ ] T021 [P] [US1] Implement the active-topic list and active-content-by-topic queries in `app/composables/usePublicContent.ts`
- [ ] T022 [P] [US1] Implement reusable topic-list, content-summary, and sanitized Markdown content-detail components in `app/components/content/TopicList.vue`, `app/components/content/ContentSummary.vue`, and `app/components/content/ContentDetail.vue`
- [ ] T023 [US1] Implement the public topic index and active-topic listing in `app/pages/index.vue`
- [ ] T024 [US1] Implement the active topic detail route, including clear empty and unavailable states, in `app/pages/topics/[slug]/index.vue`
- [ ] T025 [US1] Implement the active content direct-link route with sanitized Markdown rendering and no inactive-content disclosure in `app/pages/topics/[topicSlug]/[contentSlug].vue`
- [ ] T026 [US1] Run the US1 unit, component, and end-to-end tests in `tests/unit/useContentRepository.spec.ts`, `tests/component/publicContent.spec.ts`, and `tests/e2e/public-content.spec.ts`

**Checkpoint**: Visitors can independently use the public content experience, and inactive records
are not exposed by the UI or direct paths.

---

## Phase 4: User Story 2 - Sign In as Administrator (Priority: P1)

**Goal**: Only an allow-listed administrator can enter the management area; signed-out,
expired-session, and non-administrator users are denied.

**Independent Test**: Request an administration route signed out, sign in with invalid,
non-administrator, and administrator credentials, then sign out and confirm management access ends.

- [ ] T027 [P] [US2] Write unit tests for administrator-session and allow-list state resolution in `tests/unit/useAdministratorSession.spec.ts`
- [ ] T028 [P] [US2] Write end-to-end coverage for signed-out denial, invalid sign-in, non-administrator denial, administrator access, session expiry, and sign-out in `tests/e2e/administrator-auth.spec.ts`
- [ ] T029 [P] [US2] Implement administrator identity, allow-list lookup, sign-in, and sign-out behavior with explicit errors in `app/composables/useAdministratorSession.ts`
- [ ] T030 [P] [US2] Implement the sign-in form with actionable credential and session errors in `app/components/admin/AdminSignInForm.vue`
- [ ] T031 [US2] Implement route middleware that redirects signed-out, expired, and non-administrator users without exposing management data in `app/middleware/admin.ts`
- [ ] T032 [US2] Implement the administrator sign-in page and protected administration shell in `app/pages/admin/index.vue` and `app/layouts/admin.vue`
- [ ] T033 [US2] Run the US2 unit and end-to-end tests in `tests/unit/useAdministratorSession.spec.ts` and `tests/e2e/administrator-auth.spec.ts`

**Checkpoint**: The administrator boundary works independently, and direct protected-route access
fails safely for every unauthorized state.

---

## Phase 5: User Story 3 - Manage Topics and Content (Priority: P2)

**Goal**: An authorized administrator can maintain topics and written content, control each
record's active state, and immediately verify the public visibility result.

**Independent Test**: Sign in as the administrator; create a unique topic and inactive content,
edit both, activate and deactivate them, and confirm each public visibility transition.

- [ ] T034 [P] [US3] Write repository tests for authorized create/update/activation requests and duplicate or blank validation failures in `tests/unit/useAdminContentRepository.spec.ts`
- [ ] T035 [P] [US3] Write component tests that retain entered values and show field-level errors for invalid topic and Markdown content submissions in `tests/component/adminContentForms.spec.ts`
- [ ] T036 [P] [US3] Write end-to-end coverage for creating, editing, activating, and deactivating a topic and Markdown content item in `tests/e2e/admin-content-management.spec.ts`
- [ ] T037 [P] [US3] Implement authorized topic/content CRUD and active-state mutations with explicit authorization and validation errors in `app/composables/useAdminContentRepository.ts`
- [ ] T038 [P] [US3] Implement the topic editor with the quoted constraints “Required; trimmed, non-empty, unique display name” and “Required; unique URL-safe identifier” in `app/components/admin/TopicForm.vue`
- [ ] T039 [P] [US3] Implement the Markdown content editor with the quoted constraints “Required; trimmed and non-empty,” “Required; non-empty Markdown source content,” a required topic, and a unique URL-safe slug in `app/components/admin/ContentForm.vue`
- [ ] T040 [US3] Implement topic and content management lists, Markdown previews, editing routes, and activate/deactivate confirmations in `app/pages/admin/topics/index.vue`, `app/pages/admin/topics/[id].vue`, `app/pages/admin/content/index.vue`, and `app/pages/admin/content/[id].vue`
- [ ] T041 [US3] Integrate expired-session handling into management submissions and verify no update is silently applied in `app/composables/useAdminContentRepository.ts`
- [ ] T042 [US3] Run the US3 unit, component, and end-to-end tests in `tests/unit/useAdminContentRepository.spec.ts`, `tests/component/adminContentForms.spec.ts`, and `tests/e2e/admin-content-management.spec.ts`

**Checkpoint**: An authorized administrator can manage the full content lifecycle, and visibility
follows the data-boundary rules.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete quality gates, deployment verification, and operator documentation across all
stories.

- [ ] T043 [P] Add accessible labels, focus management, semantic landmarks, and responsive styles across `app/components/` and `app/assets/css/main.css`
- [ ] T044 [P] Add deployment, Pages configuration, public-data warning, Markdown authoring, and administrator bootstrap documentation in `README.md`
- [ ] T045 [P] Add the expected static artifact and repository-path deployment assertions in `tests/integration/github-pages-build.spec.ts`
- [ ] T046 Run formatting, linting, type checking, unit tests, component tests, end-to-end tests, and database-policy tests using `package.json` and `supabase/tests/content_access_rls.test.sql`
- [ ] T047 Build with the GitHub Pages preset, deploy through `.github/workflows/deploy-pages.yml`, and execute all scenarios in `specs/001-manage-astrology-content/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: Starts immediately.
- **Phase 2 — Foundational**: Requires T001–T006 and blocks every user story.
- **Phase 3 — US1**: Requires Phase 2; delivers the public MVP.
- **Phase 4 — US2**: Requires Phase 2; can proceed in parallel with US1.
- **Phase 5 — US3**: Requires Phase 2 and US2 because it uses the administration boundary; its
  public-visibility verification integrates with US1.
- **Phase 6 — Polish**: Requires all desired user stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on US2 or US3 after the foundation.
- **US2 (P1)**: No dependency on US1 or US3 after the foundation.
- **US3 (P2)**: Depends on US2 for protected administration and uses US1 to validate public
  visibility.

### Parallel Opportunities

- T002–T005 can run in parallel after T001.
- T009–T012 can run in parallel after T007 and T008 as applicable.
- US1 and US2 can begin in parallel after Phase 2.
- Within each story, all test tasks marked `[P]` can run in parallel; then the independent
  components and composables marked `[P]` can run in parallel.
- T042–T044 can run in parallel after story implementation.

## Parallel Example: User Story 1

```text
Task: "Write repository tests in tests/unit/useContentRepository.spec.ts"
Task: "Write component tests in tests/component/publicContent.spec.ts"
Task: "Write end-to-end coverage in tests/e2e/public-content.spec.ts"

Task: "Implement public queries in app/composables/usePublicContent.ts"
Task: "Implement content components in app/components/content/TopicList.vue,
app/components/content/ContentSummary.vue, and app/components/content/ContentDetail.vue"
```

## Parallel Example: User Story 2

```text
Task: "Write session unit tests in tests/unit/useAdministratorSession.spec.ts"
Task: "Write authorization end-to-end tests in tests/e2e/administrator-auth.spec.ts"

Task: "Implement session behavior in app/composables/useAdministratorSession.ts"
Task: "Implement sign-in UI in app/components/admin/AdminSignInForm.vue"
```

## Parallel Example: User Story 3

```text
Task: "Write repository tests in tests/unit/useAdminContentRepository.spec.ts"
Task: "Write form component tests in tests/component/adminContentForms.spec.ts"
Task: "Write end-to-end coverage in tests/e2e/admin-content-management.spec.ts"

Task: "Implement topic form in app/components/admin/TopicForm.vue"
Task: "Implement content form in app/components/admin/ContentForm.vue"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete US1 and validate public browsing independently.
3. Deploy a preview only after data policies prove inactive content cannot be read publicly.

### Incremental Delivery

1. Deliver US1 as public read-only content browsing.
2. Add US2 to establish the secured administrator boundary.
3. Add US3 to make the content lifecycle self-service.
4. Complete cross-cutting quality and production deployment validation.
