UPDATE star_showcase_config
SET
  selected_author_names = REPLACE(selected_author_names, 'Josh=Yehoshua Shachar', 'Josh Yehoshua Shachar'),
  updated_at = CURRENT_TIMESTAMP
WHERE selected_author_names LIKE '%Josh=Yehoshua Shachar%';
