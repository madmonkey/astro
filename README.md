# Astro

Astro is a statically deployed Nuxt site for publishing astrology topics and Markdown articles.
Visitors can browse active content without an account. Allow-listed Supabase users can sign in to
manage topics and content.

## Technology and security model

- Nuxt is built as a static GitHub Pages site under `/astro/`.
- Supabase Auth provides administrator sign-in; PostgreSQL row-level security (RLS) is the
  authorization boundary.
- The browser receives only the Supabase URL and publishable key. Never expose a service-role key
  or database password in this project, GitHub Actions, or the browser.
- Public queries can read only active topics and content belonging to active topics. The UI is not
  relied on to protect inactive records.
- Article bodies are Markdown. Authored raw HTML is discarded and rendered output is sanitized.
  Markdown images may use remote HTTP or HTTPS URLs; data URLs and other unsafe schemes are excluded.
- The administrator workspace uses Nuxt UI and a Markdown source editor with formatting helpers and
  a sanitized live preview. Topic deletion permanently cascades to its assigned content.
- After three failed credential submissions, the administrator sign-in form blocks further attempts
  in that browser for 15 minutes. This is a client-side usability throttle; configure Supabase Auth
  rate limits and CAPTCHA for server-enforced abuse protection.

## Local development

Use Node.js 22.19.0 or later and Docker.

```bash
npm ci
Copy-Item .env.example .env
npx supabase start
npx supabase db reset --local
npm run dev
```

Open `http://localhost:3000/astro/`. The local reset loads visual seed data. Use
`npx supabase db reset --local --no-seed` to omit it.

Set these public values in `.env`:

```dotenv
NUXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local-publishable-key>
```

Get the local values from `npx supabase status`. `.env` is ignored and must not be committed.

### Local administrator

Local Supabase has signup disabled. Create an Auth account through Supabase Studio or the Auth
admin API, then add its user ID to `public.administrator_profiles`. The account can then sign in at
`/astro/admin`.

```sql
insert into public.administrator_profiles (user_id)
values ('<local-auth-user-id>');
```

Detailed migration, hosted allow-list, session, and seed-data instructions are in
[supabase/README.md](supabase/README.md).

## Validation

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
npx supabase test db
npm run build
```

Run browser tests against a local Supabase stack configured with public runtime values. The policy
suite verifies RLS independently of the user interface.

To run the administrator browser workflow, provide a local allow-listed administrator only in the
current shell:

```powershell
$env:E2E_ADMIN_EMAIL = '<local-administrator-email>'
$env:E2E_ADMIN_PASSWORD = '<local-administrator-password>'
npm run test:e2e -- tests/e2e/admin-content-management.spec.ts
```

The administrator browser test is skipped when those variables are absent and creates local-only
records; reset the local database afterward if desired.

## Hosted Supabase bootstrap

1. Apply `supabase/migrations/0001_initial_schema.sql` and
   `supabase/migrations/0002_access_policies.sql` in order.
2. Create the administrator Auth accounts in Supabase.
3. Allow-list each administrator ID in `public.administrator_profiles`.
4. Configure the hosted Auth site URL and redirect URLs as documented in
   [supabase/README.md](supabase/README.md).

Do not apply `supabase/seed.sql` to the hosted project.

## GitHub Pages deployment

Pushing `main` runs `.github/workflows/deploy-pages.yml`. Configure these **repository variables**
before deploying:

| Variable                               | Value                           |
| -------------------------------------- | ------------------------------- |
| `NUXT_PUBLIC_SUPABASE_URL`             | Hosted Supabase project URL     |
| `NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Hosted Supabase publishable key |

In repository **Settings > Pages**, select **GitHub Actions** as the deployment source. GitHub Pages
output is public even when the source repository is private; never publish non-public content,
credentials, or service-role keys.

The deployment workflow defaults `NUXT_APP_BASE_URL` to `/astro/`. Set the optional
`NUXT_APP_BASE_URL` repository variable to `/` before deploying to a root custom domain.

### Custom domain

When a domain is selected:

1. In **Settings > Pages**, enter the domain under **Custom domain** and enable HTTPS after DNS
   verification completes.
2. Create the DNS record GitHub requests: use a `CNAME` for a subdomain or GitHub's documented
   apex-domain records for a root domain. Do not point the domain directly at Supabase.
3. Set the repository variable `NUXT_APP_BASE_URL` to `/` for a root custom-domain deployment.
   Keep `/astro/` if the site intentionally remains under that repository path.
4. Update Supabase **Authentication > URL Configuration** with the custom-domain site URL and
   matching redirect URL, including the selected base path.
5. Push `main`, verify the Pages workflow, open the custom-domain public site, and verify the
   administrator sign-in redirect flow.

Do not add a `CNAME` file until the actual domain is chosen; its value must be the exact verified
hostname.
