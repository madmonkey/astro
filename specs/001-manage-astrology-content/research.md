# Research: Manage Astrology Content

## Nuxt and GitHub Pages

**Decision**: Use Nuxt 4.5.2, the latest version published to npm on 2026-09-24, and build with
Nuxt's `github_pages` deployment preset. Configure the application base path for
`/astro/` when no custom domain is used.

**Rationale**: Nuxt's official GitHub Pages guide documents the preset and the repository-path
requirement. The preset generates a static artifact suitable for GitHub Pages, and GitHub Actions
can upload and deploy that artifact without committing generated files.

**Alternatives considered**:

- Publish a built `gh-pages` branch: rejected because an Actions artifact deployment keeps build
  output out of source branches and follows Nuxt's documented GitHub Pages workflow.
- Use a server-hosting provider: rejected because the requested target is GitHub Pages.

## Dynamic Content on Static Hosting

**Decision**: Render the application shell statically and retrieve topics and content in the
browser from Supabase.

**Rationale**: GitHub Pages serves static files and cannot run Nuxt server routes. Browser data
queries allow administrator changes to appear without rebuilding the site. Public data access is
limited by database policies to active records.

**Alternatives considered**:

- Rebuild and redeploy after every content change: rejected because publication would depend on a
  deployment cycle and would not meet immediate content-management expectations.
- Add a custom backend in the Pages repository: rejected because GitHub Pages cannot host it.

## Administrator Authentication and Authorization

**Decision**: Use Supabase Auth for administrator sign-in and PostgreSQL row-level security (RLS)
for all database authorization. Maintain an `administrator_profiles` allow-list keyed to the
authenticated user's identifier.

**Rationale**: RLS applies authorization at the data boundary, including direct browser requests.
The public role receives only `SELECT` access to active rows; administrator write policies require
both an authenticated session and an allow-list record. No service-role secret is present in the
application.

**Alternatives considered**:

- Hide management controls in the client: rejected because it does not block direct requests.
- Grant all authenticated users write access: rejected because the feature requires a secured
  administrator, not general authenticated contributors.

## Data Access Keys and Sessions

**Decision**: Supply only the Supabase project URL and publishable key to the browser through
build-time public configuration; configure administrator session lifetime and inactivity controls
in the Supabase project.

**Rationale**: Supabase documents publishable browser connection values and requires RLS to secure
data. Its service-role credential bypasses RLS and must remain server-side. Session controls support
the feature's expiry requirement.

**Alternatives considered**:

- Store a privileged credential in a GitHub Actions variable for browser bundling: rejected because
  built browser assets are public and the credential would bypass database protection.

## Markdown Content Rendering

**Decision**: Store the administrator's content body as Markdown and render it for visitors through
a Markdown parser followed by HTML sanitization. Raw HTML authored inside Markdown is not supported.

**Rationale**: Markdown gives the administrator expressive formatting without requiring a rich-text
editor. Sanitization prevents stored content from executing scripts or injecting unsafe markup into
public and administration pages.

**Alternatives considered**:

- Store pre-rendered HTML: rejected because it makes safe editing and review harder and increases
  the risk of persisting unsafe markup.
- Use a rich-text editor: rejected because Markdown directly meets the authoring need with less
  application complexity.
