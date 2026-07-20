CREATE VIRTUAL TABLE IF NOT EXISTS book_titles_search USING fts5(book_id UNINDEXED, value, tokenize='trigram');

INSERT INTO book_titles_search (book_id, value)
SELECT book_id, value FROM book_work_titles;
