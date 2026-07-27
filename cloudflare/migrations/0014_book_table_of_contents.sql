CREATE TABLE IF NOT EXISTS book_table_of_contents_metadata (
  book_id INTEGER PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
  shelfmark TEXT NOT NULL DEFAULT '',
  manuscript_code TEXT NOT NULL DEFAULT '',
  publication_code TEXT NOT NULL DEFAULT '',
  edition_code TEXT NOT NULL DEFAULT '',
  issue_code TEXT NOT NULL DEFAULT '',
  source_author_id TEXT NOT NULL DEFAULT '',
  source_contributor_id TEXT NOT NULL DEFAULT '',
  source_publisher_id TEXT NOT NULL DEFAULT '',
  is_available INTEGER NOT NULL DEFAULT 0,
  author_count INTEGER NOT NULL DEFAULT 0,
  chapter_count INTEGER NOT NULL DEFAULT 0,
  title_count INTEGER NOT NULL DEFAULT 0,
  availability_details TEXT NOT NULL DEFAULT '',
  bnf_data TEXT NOT NULL DEFAULT '',
  remarks TEXT NOT NULL DEFAULT '',
  weight TEXT NOT NULL DEFAULT '',
  genre_source_code TEXT NOT NULL DEFAULT '',
  genre_source_label TEXT NOT NULL DEFAULT '',
  rubric_source_code TEXT NOT NULL DEFAULT '',
  rubric_source_label TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS book_table_of_contents_entries (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  source_entry_id TEXT NOT NULL DEFAULT '',
  source_author_id TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  page TEXT NOT NULL DEFAULT '',
  UNIQUE(book_id, source_entry_id),
  UNIQUE(book_id, position)
);

CREATE INDEX IF NOT EXISTS book_table_of_contents_entries_book_position_idx
  ON book_table_of_contents_entries(book_id, position);
