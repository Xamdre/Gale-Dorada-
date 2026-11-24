-- Gale Dorada: esquema inicial de tienda
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null default 'General',
  description text not null default '',
  price_cop integer not null check (price_cop >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  active boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  customer_first_name text not null,
  customer_last_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  delivery_city text not null default '',
  notes text not null default '',
  subtotal_cop integer not null check (subtotal_cop >= 0),
  shipping_cop integer not null default 0 check (shipping_cop >= 0),
  total_cop integer not null check (total_cop >= 0),
  status text not null default 'pending_payment' check (status in ('pending_payment','paid','preparing','shipped','delivered','cancelled','refunded')),
  payment_reference text,
  payment_transaction_id text,
  payment_status text not null default 'pending',
  calendar_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price_cop integer not null check (unit_price_cop >= 0),
  quantity integer not null check (quantity > 0),
  line_total_cop integer not null check (line_total_cop >= 0)
);

create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'Gale Dorada',
  logo_url text,
  primary_color text not null default '#b58b57',
  announcement text not null default 'Detalles especiales para momentos que importan.',
  contact_email text,
  contact_phone text,
  shipping_flat_cop integer not null default 0 check (shipping_flat_cop >= 0),
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

create or replace function public.is_store_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products for select using (active = true);
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin());

drop policy if exists "Admins read orders" on public.orders;
create policy "Admins read orders" on public.orders for select to authenticated using (public.is_store_admin());
drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders for update to authenticated using (public.is_store_admin()) with check (public.is_store_admin());
drop policy if exists "Admins read order items" on public.order_items;
create policy "Admins read order items" on public.order_items for select to authenticated using (public.is_store_admin());

drop policy if exists "Public read store settings" on public.store_settings;
create policy "Public read store settings" on public.store_settings for select using (true);
drop policy if exists "Admins manage store settings" on public.store_settings;
create policy "Admins manage store settings" on public.store_settings for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin());

-- Bucket público para imágenes de catálogo. Solo administradores pueden subir/cambiar/borrar.
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_store_admin());
drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_store_admin()) with check (bucket_id = 'product-images' and public.is_store_admin());
drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_store_admin());
