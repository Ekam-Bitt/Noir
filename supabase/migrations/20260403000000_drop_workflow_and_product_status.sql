alter table if exists catalog_products
  add column if not exists status text not null default 'draft'
  check (status in ('draft', 'active', 'hidden'));

alter table if exists catalog_products
  add column if not exists launch_at timestamptz;

create index if not exists idx_catalog_products_status_launch_at
  on catalog_products(status, launch_at);

alter table if exists collection_stories
  add column if not exists chapter_number text;

update collection_stories
set chapter_number = coalesce(chapter_number, eyebrow, '01')
where chapter_number is null;

alter table if exists collection_stories
  alter column chapter_number set default '01';

alter table if exists collection_stories
  alter column chapter_number set not null;

alter table if exists collection_stories
  add column if not exists image text;

alter table if exists collection_stories
  add column if not exists launch_at timestamptz;

alter table if exists collection_stories
  add column if not exists is_archived boolean not null default false;

create index if not exists idx_collection_stories_visibility_launch
  on collection_stories(is_visible, is_archived, is_featured, launch_at);
