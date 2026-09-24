export interface AdministratorProfile {
  created_at: string
  updated_at: string
  user_id: string
}

export interface Topic {
  created_at: string
  id: string
  is_active: boolean
  name: string
  slug: string
  updated_at: string
}

export interface ContentItem {
  body: string
  created_at: string
  id: string
  is_active: boolean
  slug: string
  title: string
  topic_id: string
  updated_at: string
}

export interface TopicFormInput {
  is_active: boolean
  name: string
  slug: string
}

export interface ContentItemFormInput {
  body: string
  is_active: boolean
  slug: string
  title: string
  topic_id: string
}
