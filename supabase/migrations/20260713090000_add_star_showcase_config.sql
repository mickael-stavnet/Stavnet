create table if not exists public.star_showcase_config (
  id text primary key default 'default' check (id = 'default'),
  selected_author_names text[] not null default '{}'::text[],
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.star_showcase_config enable row level security;

drop policy if exists "star showcase config is publicly readable" on public.star_showcase_config;
create policy "star showcase config is publicly readable"
  on public.star_showcase_config
  for select
  to anon, authenticated
  using (true);

grant select on table public.star_showcase_config to anon, authenticated;
grant insert, update on table public.star_showcase_config to anon, authenticated;
grant all on table public.star_showcase_config to service_role;

drop policy if exists "star showcase config can be written by admin api" on public.star_showcase_config;
create policy "star showcase config can be written by admin api"
  on public.star_showcase_config
  for all
  to anon, authenticated
  using (id = 'default')
  with check (id = 'default');

insert into public.star_showcase_config (id, selected_author_names)
values ('default', '{}'::text[])
on conflict (id) do nothing;
