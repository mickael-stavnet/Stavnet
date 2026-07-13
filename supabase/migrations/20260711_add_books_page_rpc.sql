create or replace function public.get_books_page(
  p_page integer default 1,
  p_page_size integer default 13,
  p_search text default null,
  p_title text default null,
  p_person_last_name text default null,
  p_person_first_name text default null,
  p_organization text default null,
  p_theme text default null,
  p_publication_language text default null,
  p_year text default null,
  p_general_search text default null
)
returns jsonb
language sql
stable
as $$
  with params as (
    select
      greatest(coalesce(p_page, 1), 1) as page,
      greatest(coalesce(p_page_size, 13), 1) as page_size,
      nullif(lower(btrim(coalesce(p_search, ''))), '') as search,
      nullif(lower(btrim(coalesce(p_title, ''))), '') as title,
      nullif(lower(btrim(coalesce(p_person_last_name, ''))), '') as person_last_name,
      nullif(lower(btrim(coalesce(p_person_first_name, ''))), '') as person_first_name,
      nullif(lower(btrim(coalesce(p_organization, ''))), '') as organization,
      nullif(lower(btrim(coalesce(p_theme, ''))), '') as theme,
      nullif(lower(btrim(coalesce(p_publication_language, ''))), '') as publication_language,
      nullif(lower(btrim(coalesce(p_year, ''))), '') as year,
      nullif(lower(btrim(coalesce(p_general_search, ''))), '') as general_search
  ),
  source as (
    select
      b.id,
      btrim(coalesce(b."Titre", '')) as title,
      btrim(concat_ws(' ', nullif(b."Auteur. 1. Nom", ''), nullif(b."Auteur. 1. Prénom", ''))) as author,
      btrim(coalesce(nullif(b."Éditeur. 1. Nom", ''), nullif(b."Éditeur", ''), '')) as publisher,
      btrim(coalesce(b."Langue", '')) as language,
      btrim(coalesce(nullif(b."Auteur. 1. Langue", ''), nullif(b."Auteur. 2. Langue", ''), nullif(b."Auteur. 3. Langue", ''), '')) as writing_language,
      btrim(coalesce(b."Année"::text, '')) as year,
      btrim(coalesce(b."Année. Pages. Dimensions", '')) as publication_code,
      lower(concat_ws(' ',
        b."Titre",
        b."Titre. Anglais",
        b."Titre. Original",
        b."Titre. Transcription"
      )) as title_blob,
      lower(concat_ws(' ',
        b."Titre",
        b."Titre. Anglais",
        b."Titre. Original",
        b."Titre. Transcription",
        b."Sous-titre",
        b."Auteur. 1. Nom",
        b."Auteur. 1. Prénom",
        b."Auteur. 2. Nom",
        b."Auteur. 2. Prénom",
        b."Auteur. 3. Nom",
        b."Auteur. 3. Prénom",
        b."Contrib. 1. Nom",
        b."Contrib. 1. Prénom",
        b."Contrib. 2. Nom",
        b."Contrib. 2. Prénom",
        b."Contrib. 3. Nom",
        b."Contrib. 3. Prénom",
        b."Contrib. 4. Nom",
        b."Contrib. 4. Prénom",
        b."Contrib. 5. Nom",
        b."Contrib. 5. Prénom",
        b."Contrib. 6. Nom",
        b."Contrib. 6. Prénom",
        b."Contrib. 7. Nom",
        b."Contrib. 7. Prénom",
        b."Contrib. 8. Nom",
        b."Contrib. 8. Prénom",
        b."Contrib. 9. Nom",
        b."Contrib. 9. Prénom",
        b."Contrib. 10. Nom",
        b."Contrib. 10. Prénom",
        b."Éditeur",
        b."Éditeur. 1. Nom",
        b."Éditeur. 2. Nom",
        b."Langue",
        b."Année"::text,
        b."Année. Pages. Dimensions",
        b."Thème. 1",
        b."Thème. 2",
        b."Résumé",
        b."Sommaire",
        b."Genre",
        b."Genre. 1",
        b."Genre. 2",
        b."Rubrique",
        b."Catégorie. 1",
        b."Catégorie. 2"
      )) as search_blob,
      lower(concat_ws(' ',
        b."Auteur. 1. Nom",
        b."Auteur. 2. Nom",
        b."Auteur. 3. Nom",
        b."Éditeur",
        b."Éditeur. 1. Nom",
        b."Éditeur. 2. Nom"
      )) as organization_blob,
      lower(concat_ws(' ',
        b."Thème. 1",
        b."Thème. 2"
      )) as theme_blob,
      lower(concat_ws(' ',
        b."Auteur. 1. Nom",
        b."Auteur. 2. Nom",
        b."Auteur. 3. Nom"
      )) as author_last_name_blob,
      lower(concat_ws(' ',
        b."Auteur. 1. Prénom",
        b."Auteur. 2. Prénom",
        b."Auteur. 3. Prénom"
      )) as author_first_name_blob
    from public."data-books" b
    where btrim(coalesce(b."Titre", '')) <> ''
      and btrim(coalesce(b."Titre", '')) <> 'NULL'
  ),
  filtered as (
    select s.*
    from source s
    cross join params p
    where (p.search is null or s.search_blob like '%' || p.search || '%')
      and (p.general_search is null or s.search_blob like '%' || p.general_search || '%')
      and (p.title is null or s.title_blob like '%' || p.title || '%')
      and (p.person_last_name is null or s.author_last_name_blob like '%' || p.person_last_name || '%')
      and (p.person_first_name is null or s.author_first_name_blob like '%' || p.person_first_name || '%')
      and (p.organization is null or s.organization_blob like '%' || p.organization || '%')
      and (p.theme is null or s.theme_blob like '%' || p.theme || '%')
      and (p.publication_language is null or lower(s.language) like '%' || p.publication_language || '%')
      and (p.year is null or lower(s.year) like '%' || p.year || '%')
  ),
  paged as (
    select f.*
    from filtered f
    cross join params p
    order by nullif(regexp_replace(f.year, '[^0-9]', '', 'g'), '')::integer desc nulls last, lower(f.title), f.id
    offset (select (page - 1) * page_size from params)
    limit (select page_size from params)
  )
  select jsonb_build_object(
    'items',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'title', title,
            'author', author,
            'publisher', publisher,
            'language', language,
            'writingLanguage', writing_language,
            'year', year,
            'publicationCode', publication_code
          )
          order by nullif(regexp_replace(year, '[^0-9]', '', 'g'), '')::integer desc nulls last, lower(title), id
        )
        from paged
      ),
      '[]'::jsonb
    ),
    'totalCount', (select count(*) from filtered),
    'databaseTotal', (select count(*) from public."data-books")
  );
$$;

grant execute on function public.get_books_page(integer, integer, text, text, text, text, text, text, text, text, text) to anon, authenticated;
