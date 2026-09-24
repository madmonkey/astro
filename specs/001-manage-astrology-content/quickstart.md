# Quickstart: Manage Astrology Content

## Prerequisites

- Node.js 22.19.0 or later and npm.
- A Supabase project configured with two administrator identities and the schema/policies in
  [data-model.md](data-model.md).
- A GitHub repository whose Pages settings permit GitHub Actions deployments. GitHub Pages output
  is public even when the repository is private, subject to the account or organization plan.

## Configure Local Development

1. Install project dependencies with `npm install`.
2. Create a local environment file from the project's example configuration.
3. Provide the Supabase project URL and publishable key only. Do not add a service-role key.
4. Apply database migrations and run the RLS policy tests.
5. Start local development with `npm run dev`.

## Validate Public Content

1. Create an active topic and active content as the administrator.
2. In a signed-out browser session, open the topic and content paths.
3. Confirm the item appears and can be read.
4. Confirm headings, links, emphasis, and lists authored in Markdown render as expected, while raw
   HTML does not render.
5. Deactivate the item, refresh the public path, and confirm an unavailable state appears without
   exposing its title or body.
6. Reactivate the item and confirm it appears again without a static-site redeploy.

## Validate Administration Security

1. In a signed-out browser session, request an administration route and confirm a sign-in prompt.
2. Sign in using a non-administrator identity and confirm protected functions remain unavailable.
3. Sign in with the designated administrator identity.
4. Create a topic and inactive Markdown content; validate errors for blank, duplicate, and invalid
   fields.
5. Activate and deactivate both records; confirm public visibility follows the state rules in
   [application-access.md](contracts/application-access.md).
6. Sign out and confirm that management access ends. If the Supabase plan supports configured
   expiry, repeat after expiry; otherwise record the Free-plan session-control limitation.

## Validate Quality and Deployment

1. Run formatting, lint, type-check, unit, component, end-to-end, and database-policy test
   commands defined by the project.
2. Build with the GitHub Pages preset, setting the application base path to `/astro/` unless a
   custom domain is configured.
3. Confirm the generated static artifact contains the expected application entry and fallback
   pages.
4. Push to `main`; verify the Pages workflow succeeds and open the published site at its
   repository path.
5. Repeat the public and administration smoke scenarios against the deployed site.

## Map a Custom Domain

After a domain is selected, configure it in GitHub **Settings > Pages**, create the DNS record
requested by GitHub, and enable HTTPS. Set the `NUXT_APP_BASE_URL` repository variable to `/` for
a root custom-domain deployment, then add the exact custom-domain site and redirect URLs in
Supabase Auth configuration. Push `main` and repeat the public and administrator smoke scenarios
through the custom domain.
