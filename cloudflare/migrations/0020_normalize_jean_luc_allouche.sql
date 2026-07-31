UPDATE books
SET
  payload = json_set(
    payload,
    '$."Contrib. 1. Prénom"', 'Jean-Luc',
    '$."Contrib. 1. Nom"', 'Allouche'
  ),
  search_text = replace(replace(search_text, 'Jean=Luc', 'Jean-Luc'), 'Jean-Luc Allouch', 'Jean-Luc Allouche'),
  updated_at = CURRENT_TIMESTAMP,
  updated_by = 'data-migration',
  version = version + 1
WHERE id IN (5023, 5024, 5025, 5050)
  AND (
    json_extract(payload, '$."Contrib. 1. Prénom"') <> 'Jean-Luc'
    OR json_extract(payload, '$."Contrib. 1. Nom"') <> 'Allouche'
  );

DELETE FROM book_facets
WHERE book_id IN (5023, 5024, 5025, 5050)
  AND facet = 'contributorName';

INSERT INTO book_facets (book_id, facet, value, sort_title)
SELECT id, 'contributorName', 'jean-luc allouche', lower(title)
FROM books
WHERE id IN (5023, 5024, 5025, 5050);

INSERT INTO books_search(books_search) VALUES('rebuild');
