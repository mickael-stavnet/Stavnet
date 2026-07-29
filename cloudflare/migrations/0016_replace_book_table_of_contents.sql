DROP TABLE IF EXISTS book_table_of_contents_metadata;
DROP TABLE IF EXISTS book_table_of_contents_entries;

CREATE TABLE book_table_of_contents_entries (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  entry_type TEXT NOT NULL DEFAULT 'nouvelle',
  title TEXT NOT NULL,
  page TEXT NOT NULL DEFAULT '',
  author_last_name TEXT NOT NULL DEFAULT '',
  author_first_name TEXT NOT NULL DEFAULT '',
  author_writing_language TEXT NOT NULL DEFAULT '',
  translator_last_name TEXT NOT NULL DEFAULT '',
  translator_first_name TEXT NOT NULL DEFAULT '',
  translator_language TEXT NOT NULL DEFAULT '',
  UNIQUE(book_id, position)
);

CREATE INDEX book_table_of_contents_entries_book_position_idx
  ON book_table_of_contents_entries(book_id, position);
