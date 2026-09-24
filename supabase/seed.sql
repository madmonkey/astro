insert into public.topics (id, name, slug, is_active)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'Moon Phases',
    'moon-phases',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Zodiac Signs',
    'zodiac-signs',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'Planetary Basics',
    'planetary-basics',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Private Drafts',
    'private-drafts',
    false
  )
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  is_active = excluded.is_active;

insert into public.content_items (
  id,
  topic_id,
  title,
  slug,
  body,
  is_active
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Finding Your Rhythm with the Moon',
    'finding-your-rhythm-with-the-moon',
    $markdown$
The lunar cycle offers a gentle way to notice **beginnings**, momentum, release, and rest.

## Start with observation

1. Notice the current moon phase.
2. Write down what feels newly possible.
3. Return to the same question next week.

> Astrology is a language for reflection, not a substitute for your own judgment.

[Learn more about lunar cycles](https://en.wikipedia.org/wiki/Lunar_phase).
$markdown$,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'A Gentle Introduction to the Zodiac',
    'a-gentle-introduction-to-the-zodiac',
    $markdown$
Each zodiac sign describes a different style of meeting the world. Read about the signs with
curiosity, and look for patterns rather than fixed labels.
$markdown$,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'New Moon Reflection Prompts',
    'new-moon-reflection-prompts',
    $markdown$
This unpublished draft should never be visible to public visitors.
$markdown$,
    false
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000003',
    'Hidden Topic Content',
    'hidden-topic-content',
    $markdown$
This published item belongs to an inactive topic and should remain unavailable publicly.
$markdown$,
    true
  )
on conflict (id) do update
set
  topic_id = excluded.topic_id,
  title = excluded.title,
  slug = excluded.slug,
  body = excluded.body,
  is_active = excluded.is_active;
