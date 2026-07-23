ALTER TABLE books ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
ALTER TABLE books ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE books ADD COLUMN archived_at TEXT;
ALTER TABLE books ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE books ADD COLUMN image_key TEXT;
ALTER TABLE people ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
ALTER TABLE people ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE people ADD COLUMN archived_at TEXT;
ALTER TABLE people ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE people ADD COLUMN image_key TEXT;
ALTER TABLE organizations ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
ALTER TABLE organizations ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE organizations ADD COLUMN archived_at TEXT;
ALTER TABLE organizations ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE organizations ADD COLUMN image_key TEXT;

CREATE TABLE IF NOT EXISTS book_person_links (
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  person_id INTEGER NOT NULL REFERENCES people(id),
  role TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (book_id, person_id, role, position)
);

CREATE TABLE IF NOT EXISTS book_organization_links (
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  role TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (book_id, organization_id, role, position)
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  occurred_at TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  entity_label TEXT NOT NULL,
  summary TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT
);

CREATE INDEX IF NOT EXISTS books_admin_status_idx ON books(is_valid, updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS people_admin_status_idx ON people(archived_at, name, id);
CREATE INDEX IF NOT EXISTS organizations_admin_status_idx ON organizations(archived_at, name, id);
CREATE INDEX IF NOT EXISTS admin_audit_logs_recent_idx ON admin_audit_logs(occurred_at DESC, id DESC);

UPDATE books SET created_at = COALESCE(NULLIF(created_at, ''), '2026-07-23T00:00:00.000Z'), updated_at = COALESCE(NULLIF(updated_at, ''), '2026-07-23T00:00:00.000Z');
UPDATE people SET created_at = COALESCE(NULLIF(created_at, ''), '2026-07-23T00:00:00.000Z'), updated_at = COALESCE(NULLIF(updated_at, ''), '2026-07-23T00:00:00.000Z');
UPDATE organizations SET created_at = COALESCE(NULLIF(created_at, ''), '2026-07-23T00:00:00.000Z'), updated_at = COALESCE(NULLIF(updated_at, ''), '2026-07-23T00:00:00.000Z');
