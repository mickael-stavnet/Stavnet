create or replace function public.get_books_page_by_facet(
  p_page integer default 1,
  p_page_size integer default 13,
  p_facet text default null,
  p_value text default null
)
returns jsonb
language sql
stable
as $$
  with params as (
    select
      greatest(coalesce(p_page, 1), 1) as page,
      greatest(coalesce(p_page_size, 13), 1) as page_size,
      btrim(coalesce(p_facet, '')) as facet,
      lower(btrim(coalesce(p_value, ''))) as normalized_value
  ),
  filtered as (
    select
      b.id,
      btrim(coalesce(b."Titre", '')) as title,
      btrim(
        coalesce(
          nullif(concat_ws(' ', nullif(b."Auteur. 1. Prénom", ''), nullif(b."Auteur. 1. Nom", '')), ''),
          nullif(concat_ws(' ', nullif(b."Auteur. 1. Nom", ''), nullif(b."Auteur. 1. Prénom", '')), ''),
          ''
        )
      ) as author,
      btrim(coalesce(nullif(b."Éditeur. 1. Nom", ''), nullif(b."Éditeur", ''), '')) as publisher,
      btrim(coalesce(b."Langue", '')) as language,
      btrim(coalesce(b."Année"::text, '')) as year,
      btrim(coalesce(b."Année. Pages. Dimensions", '')) as publication_code
    from public."data-books" b
    cross join params p
    where btrim(coalesce(b."Titre", '')) <> ''
      and p.facet <> ''
      and p.normalized_value <> ''
      and case
        when p.facet = 'authorName' then
          p.normalized_value in (
            lower(btrim(concat_ws(' ', nullif(b."Auteur. 1. Prénom", ''), nullif(b."Auteur. 1. Nom", '')))),
            lower(btrim(concat_ws(' ', nullif(b."Auteur. 2. Prénom", ''), nullif(b."Auteur. 2. Nom", '')))),
            lower(btrim(concat_ws(' ', nullif(b."Auteur. 3. Prénom", ''), nullif(b."Auteur. 3. Nom", ''))))
          )
        when p.facet = 'translationLanguage' then
          lower(btrim(coalesce(b."Langue", ''))) = p.normalized_value
        when p.facet = 'authorType' then
          p.normalized_value in (
            lower(btrim(coalesce(b."Auteur. 1. Type", ''))),
            lower(btrim(coalesce(b."Auteur. 2. Type", ''))),
            lower(btrim(coalesce(b."Auteur. 3. Type", '')))
          )
        when p.facet = 'authorWritingLanguage' then
          p.normalized_value in (
            lower(btrim(coalesce(b."Auteur. 1. Langue", ''))),
            lower(btrim(coalesce(b."Auteur. 2. Langue", ''))),
            lower(btrim(coalesce(b."Auteur. 3. Langue", '')))
          )
        when p.facet = 'contributorName' then
          p.normalized_value in (
            lower(btrim(concat_ws(' ', nullif(b."Contrib. 1. Prénom", ''), nullif(b."Contrib. 1. Nom", '')))),
            lower(btrim(concat_ws(' ', nullif(b."Contrib. 2. Prénom", ''), nullif(b."Contrib. 2. Nom", '')))),
            lower(btrim(concat_ws(' ', nullif(b."Contrib. 3. Prénom", ''), nullif(b."Contrib. 3. Nom", '')))),
            lower(btrim(concat_ws(' ', nullif(b."Contrib. 4. Prénom", ''), nullif(b."Contrib. 4. Nom", '')))),
            lower(btrim(concat_ws(' ', nullif(b."Contrib. 5. Prénom", ''), nullif(b."Contrib. 5. Nom", '')))),
            lower(btrim(concat_ws(' ', nullif(b."Contrib. 6. Prénom", ''), nullif(b."Contrib. 6. Nom", '')))),
            lower(btrim(concat_ws(' ', nullif(b."Contrib. 7. Prénom", ''), nullif(b."Contrib. 7. Nom", '')))),
            lower(btrim(concat_ws(' ', nullif(b."Contrib. 8. Prénom", ''), nullif(b."Contrib. 8. Nom", '')))),
            lower(btrim(concat_ws(' ', nullif(b."Contrib. 9. Prénom", ''), nullif(b."Contrib. 9. Nom", '')))),
            lower(btrim(concat_ws(' ', nullif(b."Contrib. 10. Prénom", ''), nullif(b."Contrib. 10. Nom", ''))))
          )
        when p.facet = 'contributorType' then
          p.normalized_value in (
            lower(btrim(coalesce(b."Contrib. 1. Genre/Langue", ''))),
            lower(btrim(coalesce(b."Contrib. 2. Genre/Langue", ''))),
            lower(btrim(coalesce(b."Contrib. 3. Genre/Langue", ''))),
            lower(btrim(coalesce(b."Contrib. 4. Genre/Langue", ''))),
            lower(btrim(coalesce(b."Contrib. 5. Genre/Langue", ''))),
            lower(btrim(coalesce(b."Contrib. 6. Genre/Langue", ''))),
            lower(btrim(coalesce(b."Contrib. 7. Genre/Langue", ''))),
            lower(btrim(coalesce(b."Contrib. 8. Genre/Langue", ''))),
            lower(btrim(coalesce(b."Contrib. 9. Genre/Langue", ''))),
            lower(btrim(coalesce(b."Contrib. 10. Genre/Langue", '')))
          )
        when p.facet = 'contributorLanguage' then
          p.normalized_value in (
            lower(btrim(coalesce(b."Contrib. 1. Langue Traduite", ''))),
            lower(btrim(coalesce(b."Contrib. 2. Langue Traduite", ''))),
            lower(btrim(coalesce(b."Contrib. 3. Langue Traduite", ''))),
            lower(btrim(coalesce(b."Contrib. 4. Langue Traduite", ''))),
            lower(btrim(coalesce(b."Contrib. 5. Langue Traduite", ''))),
            lower(btrim(coalesce(b."Contrib. 6. Langue Traduite", ''))),
            lower(btrim(coalesce(to_jsonb(b)->>'Contrib. 7. Langue Traduite', ''))),
            lower(btrim(coalesce(b."Contrib. 8. Langue Traduite", ''))),
            lower(btrim(coalesce(b."Contrib. 9. Langue Traduite", ''))),
            lower(btrim(coalesce(b."Contrib. 10. Langue Traduite", '')))
          )
        when p.facet = 'publisherName' then
          p.normalized_value in (
            lower(btrim(coalesce(b."Éditeur. 1. Nom", ''))),
            lower(btrim(coalesce(b."Éditeur", ''))),
            lower(btrim(coalesce(b."Éditeur. 2. Nom", '')))
          )
        when p.facet = 'publisherCountry' then
          p.normalized_value in (
            lower(btrim(coalesce(b."Éditeur. 1. Pays", ''))),
            lower(btrim(coalesce(b."Éditeur. 2. Pays", ''))),
            lower(btrim(coalesce(b."Pays. Éditeur", '')))
          )
        when p.facet = 'category' then
          (
            lower(btrim(coalesce(b."Catégorie. 1", ''))) = p.normalized_value
            and btrim(coalesce(b."Catégorie. 1", '')) !~ '^\d{5}-[A-Z]-L\d{2}-[A-Z]-E\d{2}$'
          ) or (
            lower(btrim(coalesce(b."Catégorie. 2", ''))) = p.normalized_value
            and btrim(coalesce(b."Catégorie. 2", '')) !~ '^\d{5}-[A-Z]-L\d{2}-[A-Z]-E\d{2}$'
          )
        when p.facet = 'subject' then
          p.normalized_value in (
            lower(btrim(coalesce(b."Thème. 1", ''))),
            lower(btrim(coalesce(b."Thème. 2", '')))
          )
        when p.facet = 'genre' then
          p.normalized_value in (
            lower(btrim(coalesce(b."Genre", ''))),
            lower(btrim(coalesce(b."Genre. 1", ''))),
            lower(btrim(coalesce(b."Genre. 2", '')))
          )
        when p.facet = 'targetAudience' then
          lower(btrim(coalesce(b."Rubrique", ''))) = p.normalized_value
        else false
      end
  ),
  paged as (
    select *
    from filtered
    cross join params p
    order by lower(title), id
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
            'year', year,
            'publicationCode', publication_code
          )
          order by lower(title), id
        )
        from paged
      ),
      '[]'::jsonb
    ),
    'totalCount', (select count(*) from filtered),
    'databaseTotal', (
      select count(*)
      from public."data-books" b
      where btrim(coalesce(b."Titre", '')) <> ''
    )
  );
$$;
