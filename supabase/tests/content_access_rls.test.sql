begin;

create extension if not exists pgtap with schema extensions;

select plan(16);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'admin@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'member@example.test');

insert into public.administrator_profiles (user_id)
values ('11111111-1111-1111-1111-111111111111');

insert into public.topics (id, name, slug, is_active)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Active Topic', 'active-topic', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Inactive Topic', 'inactive-topic', false);

insert into public.content_items (id, topic_id, title, slug, body, is_active)
values
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Published Content',
    'test-published-content',
    '# Published',
    true
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Inactive Content',
    'test-inactive-content',
    '# Inactive',
    false
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc3',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Content in Inactive Topic',
    'test-hidden-topic-content',
    '# Hidden',
    true
  );

set local role anon;

select results_eq(
  $$select count(*) from public.topics
    where id in (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    )$$,
  array[1::bigint],
  'Visitors can read only active topics'
);

select results_eq(
  $$select count(*) from public.content_items
    where id in (
      'cccccccc-cccc-cccc-cccc-ccccccccccc1',
      'cccccccc-cccc-cccc-cccc-ccccccccccc2',
      'cccccccc-cccc-cccc-cccc-ccccccccccc3'
    )$$,
  array[1::bigint],
  'Visitors can read only active content in active topics'
);

select throws_ok(
  $$insert into public.topics (name, slug) values ('Visitor Topic', 'visitor-topic')$$,
  '42501',
  null,
  'Visitors cannot create topics'
);

reset role;
set local role authenticated;
set local "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';

select results_eq(
  $$select count(*) from public.topics
    where id in (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    )$$,
  array[1::bigint],
  'Authenticated non-administrators can read only active topics'
);

select results_eq(
  $$select count(*) from public.administrator_profiles
    where user_id = '11111111-1111-1111-1111-111111111111'$$,
  array[0::bigint],
  'Authenticated non-administrators cannot read administrator profiles'
);

select throws_ok(
  $$insert into public.topics (name, slug) values ('Member Topic', 'member-topic')$$,
  '42501',
  null,
  'Authenticated non-administrators cannot create topics'
);

select results_eq(
  $$update public.content_items set title = 'Changed'
    where slug = 'test-published-content'
    returning 1$$,
  array[]::integer[],
  'Authenticated non-administrators cannot update content'
);

select results_eq(
  $$delete from public.content_items
    where slug = 'test-published-content'
    returning 1$$,
  array[]::integer[],
  'Authenticated non-administrators cannot delete content'
);

reset role;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

select results_eq(
  $$select count(*) from public.administrator_profiles
    where user_id = '11111111-1111-1111-1111-111111111111'$$,
  array[1::bigint],
  'Administrators can read their own administrator profile'
);

select results_eq(
  $$select count(*) from public.topics
    where id in (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    )$$,
  array[2::bigint],
  'Administrators can read active and inactive topics'
);

select results_eq(
  $$select count(*) from public.content_items
    where id in (
      'cccccccc-cccc-cccc-cccc-ccccccccccc1',
      'cccccccc-cccc-cccc-cccc-ccccccccccc2',
      'cccccccc-cccc-cccc-cccc-ccccccccccc3'
    )$$,
  array[3::bigint],
  'Administrators can read all content'
);

select lives_ok(
  $$insert into public.topics (name, slug) values ('Administrator Topic', 'administrator-topic')$$,
  'Administrators can create topics'
);

select lives_ok(
  $$update public.content_items set title = 'Updated Content'
    where slug = 'test-published-content'$$,
  'Administrators can update content'
);

select lives_ok(
  $$delete from public.content_items where slug = 'test-published-content'$$,
  'Administrators can delete content'
);

select results_eq(
  $$delete from public.topics
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    returning 1$$,
  array[1],
  'Administrators can delete a topic'
);

select results_eq(
  $$select count(*) from public.content_items
    where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc3'$$,
  array[0::bigint],
  'Deleting a topic also removes its content'
);

select * from finish();

rollback;
