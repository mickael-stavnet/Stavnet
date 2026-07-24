UPDATE books
SET payload = json_set(
  payload,
  '$."Ouvrage collectif"',
  CASE
    WHEN id IN (129, 139, 141, 145, 1912, 2145, 2780, 2793, 2887, 2902, 2912, 2935, 2970, 2977, 4436, 4504, 4598, 4704, 4705, 4716, 5054)
      THEN json('true')
    ELSE json('false')
  END
);
