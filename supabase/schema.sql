-- Gale Dorada: catálogo y administración de productos
-- Ejecutar una sola vez en Supabase SQL Editor.
-- Después de crear tu usuario de administración, asígnale role='admin'
-- desde el SQL Editor usando su UUID de auth.users.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  sku text unique,
  short_description text,
  description text,
  price_cop bigint not null check (price_cop >= 0),
  compare_at_price_cop bigint check (compare_at_price_cop is null or compare_at_price_cop >= 0),
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, storage_path)
);

create index if not exists products_status_created_idx on public.products(status, created_at desc);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists product_images_product_sort_idx on public.product_images(product_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories
for each row execute procedure public.set_updated_at();

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles
for all to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Public read active categories" on public.categories;
create policy "Public read active categories" on public.categories
for select to anon, authenticated using (is_active or (select public.is_admin()));

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories
for all to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Public read published products" on public.products;
create policy "Public read published products" on public.products
for select to anon, authenticated using (status = 'published' or (select public.is_admin()));

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
for all to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Public read images of published products" on public.product_images;
create policy "Public read images of published products" on public.product_images
for select to anon, authenticated using (
  exists (
    select 1 from public.products p
    where p.id = product_id and (p.status = 'published' or (select public.is_admin()))
  )
);

drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images" on public.product_images
for all to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

-- Bucket público para mostrar fotos del catálogo.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public view product images" on storage.objects;
create policy "Public view product images" on storage.objects
for select to anon, authenticated using (bucket_id = 'product-images');

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'product-images' and (select public.is_admin())
);

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images" on storage.objects
for update to authenticated using (
  bucket_id = 'product-images' and (select public.is_admin())
) with check (
  bucket_id = 'product-images' and (select public.is_admin())
);

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects
for delete to authenticated using (
  bucket_id = 'product-images' and (select public.is_admin())
);
