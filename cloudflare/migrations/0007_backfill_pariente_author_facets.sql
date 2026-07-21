INSERT OR IGNORE INTO book_facets (book_id, facet, value, sort_title)
SELECT
  book_id,
  'authorName',
  CASE author
    WHEN 'Borenstein Alec' THEN 'alec borenstein'
    WHEN 'Izakson Miron C.' THEN 'miron c. izakson'
    WHEN 'Lancry Yehuda' THEN 'yehuda lancry'
    WHEN 'Miron C. Izakson' THEN 'miron c. izakson'
    WHEN 'Parienté Mickaël' THEN 'mickael pariente'
    WHEN 'Shachar Josh Yehoshua' THEN 'josh yehoshua shachar'
  END,
  lower(title)
FROM book_list_items
WHERE book_id BETWEEN 4999 AND 5053
  AND author IN (
    'Borenstein Alec',
    'Izakson Miron C.',
    'Lancry Yehuda',
    'Miron C. Izakson',
    'Parienté Mickaël',
    'Shachar Josh Yehoshua'
  );
