INSERT INTO people (name, normalized_name, payload, created_at, updated_at, version, image_key)
SELECT 'Alec Borenstein', 'alec borenstein', json_object('Nom Prenom', 'Borenstein Alec', 'Prénom Nom', 'Alec Borenstein', 'dataQuality', json_object('status', 'canonical')), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM people WHERE normalized_name = 'alec borenstein');

INSERT INTO people (name, normalized_name, payload, created_at, updated_at, version, image_key)
SELECT 'Yehuda Lancry', 'yehuda lancry', json_object('Nom Prenom', 'Lancry Yehuda', 'Prénom Nom', 'Yehuda Lancry', 'dataQuality', json_object('status', 'canonical')), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM people WHERE normalized_name = 'yehuda lancry');

INSERT INTO people (name, normalized_name, payload, created_at, updated_at, version, image_key)
SELECT 'Josh Yehoshua Shachar', 'josh yehoshua shachar', json_object('Nom Prenom', 'Shachar Josh Yehoshua', 'Prénom Nom', 'Josh Yehoshua Shachar', 'dataQuality', json_object('status', 'canonical')), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM people WHERE normalized_name = 'josh yehoshua shachar');
