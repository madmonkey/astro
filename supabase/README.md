# Supabase Operations

## Production Setup

Apply the migration files in lexical order:

1. `migrations/0001_initial_schema.sql`
2. `migrations/0002_access_policies.sql`
3. `migrations/0003_administrator_deletion.sql`

After both migrations succeed, allow-list each intended administrator by inserting their Supabase
Auth user ID into `public.administrator_profiles`. Do not add user IDs to migration files because
they differ between environments.

```sql
insert into public.administrator_profiles (user_id)
values ('<administrator-auth-user-id>')
on conflict (user_id) do nothing;
```

Verify the allow-list without exposing user IDs:

```sql
select count(*) as administrator_count
from public.administrator_profiles;
```

The production project is expected to return `2`.

## Administrator Deletion

Administrators can delete individual content items. Deleting a topic permanently deletes every
content item assigned to it. The application requires a confirmation before either action, and the
database restricts both operations to allow-listed administrators. This is destructive and cannot
be undone.

## Auth URL Configuration

In **Authentication > URL Configuration**, set:

```text
Site URL:
https://madmonkey.github.io/astro/

Redirect URLs:
http://localhost:3000/astro/
https://madmonkey.github.io/astro/
```

## Session Controls

The current Supabase Free plan does not expose maximum session lifetime or inactivity timeout
settings. This limitation is accepted for the initial release. Administrators must sign out when
they finish work; database row-level security continues to enforce administrator authorization for
every request.

When an eligible plan is enabled, configure:

- JWT expiry: 60 minutes
- Inactivity timeout: 30 minutes
- Maximum session lifetime: 8 hours
- Single session per user: enabled

## Local Database Policy Tests

Install the Supabase CLI and Docker, then initialize the local environment from the repository
root and run:

```bash
supabase start
supabase test db
```

The pgTAP suite at `tests/content_access_rls.test.sql` seeds isolated test identities and rolls its
changes back after each run. It never uses production administrator identities.

## Local Visual Seed Data

`seed.sql` is local development data only; it is not a migration and must not be applied to the
hosted project. It provides active and inactive topics plus published and unpublished Markdown
content for visual development and authorization checks.

Reset the local database with the visual seed data:

```bash
supabase db reset --local
```

Reset without it:

```bash
supabase db reset --local --no-seed
```
