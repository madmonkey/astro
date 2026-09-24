# Data Model: Manage Astrology Content

## Administrator Profile

Represents the authorized administrator allow-list record.

| Field | Rules |
|-------|-------|
| `user_id` | Required; unique identifier of the authenticated identity; primary key. |
| `created_at` | Required; set when the profile is created; immutable. |
| `updated_at` | Required; updated whenever the profile changes. |

An authenticated user is an administrator only when a matching profile exists. No public read
access is granted to this entity.

## Topic

Represents a named astrology subject that groups content.

| Field | Rules |
|-------|-------|
| `id` | Required; unique immutable identifier. |
| `name` | Required; trimmed, non-empty, unique display name. |
| `slug` | Required; unique URL-safe identifier derived or chosen from the name. |
| `is_active` | Required boolean; defaults to inactive. |
| `created_at` | Required; set when created. |
| `updated_at` | Required; updated whenever changed. |

**Relationships**: One topic has zero or more content items.

**State transitions**:

```text
inactive -> active   (administrator activates)
active -> inactive   (administrator deactivates)
```

Public readers can select a topic only when `is_active` is true. Administrators can select and
change all topics.

## Content Item

Represents a written astrology article or update.

| Field | Rules |
|-------|-------|
| `id` | Required; unique immutable identifier. |
| `topic_id` | Required; references one existing topic. |
| `title` | Required; trimmed and non-empty. |
| `slug` | Required; unique URL-safe identifier. |
| `body` | Required; non-empty Markdown source content. |
| `is_active` | Required boolean; defaults to inactive. |
| `created_at` | Required; set when created. |
| `updated_at` | Required; updated whenever changed. |

**Relationships**: Each content item belongs to one topic. A content item is publicly visible only
when both the item and its associated topic are active.

**State transitions**:

```text
inactive -> active   (administrator activates)
active -> inactive   (administrator deactivates)
```

## Authorization Rules

| Actor | Topic access | Content item access | Administrator profile access |
|-------|--------------|---------------------|------------------------------|
| Visitor | Read active only | Read items with active item and topic only | None |
| Authenticated non-administrator | Same as visitor | Same as visitor | None |
| Administrator | Create, read, update all | Create, read, update all | Read own authorization status only |

All entities require row-level security. Public and non-administrator roles have no insert, update,
or delete privilege. The initial release deactivates records instead of deleting them.
