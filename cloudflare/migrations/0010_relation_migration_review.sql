CREATE TABLE IF NOT EXISTS relation_migration_review (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  source_value TEXT NOT NULL,
  candidate_ids_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS relation_migration_review_status_idx ON relation_migration_review(status, relation_type, book_id);
