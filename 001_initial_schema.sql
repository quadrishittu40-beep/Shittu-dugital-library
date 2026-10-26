-- PostgreSQL starting schema. Apply only after configuring a database provider.
-- This migration intentionally creates the core ownership/publication model first.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE work_status AS ENUM ('draft', 'private', 'unlisted', 'published');
CREATE TYPE publication_kind AS ENUM ('owned_work', 'external_catalog');

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Library Owner',
  biography TEXT,
  portrait_storage_key TEXT,
  role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('owner', 'reader')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  body_json JSONB,
  body_text TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'en',
  status work_status NOT NULL DEFAULT 'draft',
  access_policy TEXT NOT NULL DEFAULT 'owner_only'
    CHECK (access_policy IN ('owner_only', 'authorized_users', 'link_access', 'public')),
  cover_storage_key TEXT,
  original_file_storage_key TEXT,
  original_file_name TEXT,
  original_file_mime TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(body_text, '')), 'C')
  ) STORED
);
CREATE INDEX works_owner_updated_idx ON works(owner_id, updated_at DESC);
CREATE INDEX works_publication_idx ON works(status, published_at DESC) WHERE status = 'published';
CREATE INDEX works_search_idx ON works USING GIN(search_vector);

CREATE TABLE work_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  body_json JSONB,
  body_text TEXT,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(work_id, version_number)
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);
CREATE TABLE work_tags (
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(work_id, tag_id)
);

CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  biography TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'en',
  publication_date DATE,
  cover_url TEXT,
  source_name TEXT,
  source_url TEXT,
  access_type TEXT NOT NULL DEFAULT 'external_link'
    CHECK (access_type IN ('public_domain', 'open_access', 'licensed_upload', 'external_link')),
  storage_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX publications_category_idx ON publications(category_id, publication_date DESC);

CREATE TABLE reading_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE reading_list_items (
  reading_list_id UUID NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
  work_id UUID REFERENCES works(id) ON DELETE CASCADE,
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  reading_status TEXT NOT NULL DEFAULT 'want_to_read'
    CHECK (reading_status IN ('currently_reading', 'completed', 'want_to_read')),
  private_note TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((work_id IS NOT NULL)::int + (publication_id IS NOT NULL)::int = 1),
  UNIQUE(reading_list_id, work_id),
  UNIQUE(reading_list_id, publication_id)
);
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  work_id UUID REFERENCES works(id) ON DELETE CASCADE,
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((work_id IS NOT NULL)::int + (publication_id IS NOT NULL)::int = 1)
);
CREATE TABLE reading_progress (
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  work_id UUID REFERENCES works(id) ON DELETE CASCADE,
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  last_position JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((work_id IS NOT NULL)::int + (publication_id IS NOT NULL)::int = 1),
  UNIQUE(user_id, work_id),
  UNIQUE(user_id, publication_id)
);
CREATE TABLE user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  work_id UUID REFERENCES works(id) ON DELETE CASCADE,
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((work_id IS NOT NULL)::int + (publication_id IS NOT NULL)::int = 1)
);
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  work_id UUID REFERENCES works(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO categories(name, slug) VALUES
('Books','books'),('Articles','articles'),('Essays','essays'),
('Research Papers','research-papers'),('Islamic Studies','islamic-studies'),
('Qur''an and Hadith Studies','quran-hadith-studies'),('Friday Sermons','friday-sermons'),
('Civic Education','civic-education'),('Social Studies','social-studies'),
('Academic Lesson Notes','academic-lesson-notes'),('Poetry and Creative Writing','poetry-creative-writing'),
('Personal Reflections','personal-reflections'),('Miscellaneous','miscellaneous')
ON CONFLICT DO NOTHING;

-- IMPORTANT: production row-level security / server authorization policies must be configured
-- for the selected provider before exposing the database to clients. Never expose private storage keys.
