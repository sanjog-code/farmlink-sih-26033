-- Run this in Supabase SQL Editor. This schema requires Supabase Auth.
create extension if not exists pgcrypto;

do $$ begin create type public.user_role as enum ('consumer', 'farmer', 'admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.produce_request_type as enum ('produce_intake', 'cluster_collection'); exception when duplicate_object then null; end $$;
do $$ begin create type public.request_status as enum ('pending_pickup', 'received', 'graded', 'cancelled'); exception when duplicate_object then null; end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'consumer',
  full_name text not null check (char_length(full_name) between 2 and 120),
  mobile text,
  email text,
  address text,
  farmer_id text unique,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_mobile_unique on public.profiles (mobile) where mobile is not null;

create or replace function public.create_profile_for_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name, mobile, email, address)
  values (
    new.id,
    'consumer',
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'FarmLink user'),
    nullif(new.raw_user_meta_data->>'mobile', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'address', '')
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_user();

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text,
  active boolean not null default true
);

insert into public.warehouses(name, address) values
  ('Jaipur North', 'Jaipur North aggregation warehouse'),
  ('Sanganer Hub', 'Sanganer warehouse hub')
on conflict (name) do nothing;


create table public.produce_lots (
  id uuid primary key default gen_random_uuid(),
  lot_code text not null unique,
  farmer_id uuid references public.profiles(id),
  crop text not null,
  grade text not null check (grade in ('A','B','C')),
  quantity_kg numeric not null check (quantity_kg >= 0),
  price_per_kg numeric not null check (price_per_kg >= 0),
  warehouse_id uuid not null references public.warehouses(id),
  received_at timestamptz not null default now()
);

insert into public.produce_lots (lot_code, farmer_id, crop, grade, quantity_kg, price_per_kg, warehouse_id)
select 'FL-24091', null, 'Tomato', 'A', 820, 27, id from public.warehouses where name = 'Jaipur North'
where not exists (select 1 from public.produce_lots where lot_code = 'FL-24091');
insert into public.produce_lots (lot_code, farmer_id, crop, grade, quantity_kg, price_per_kg, warehouse_id)
select 'FL-24092', null, 'Onion', 'A', 1150, 31, id from public.warehouses where name = 'Jaipur North'
where not exists (select 1 from public.produce_lots where lot_code = 'FL-24092');
insert into public.produce_lots (lot_code, farmer_id, crop, grade, quantity_kg, price_per_kg, warehouse_id)
select 'FL-24093', null, 'Potato', 'B', 540, 22, id from public.warehouses where name = 'Sanganer Hub'
where not exists (select 1 from public.produce_lots where lot_code = 'FL-24093');

create table public.produce_requests (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id),
  crop text not null,
  gross_weight_kg numeric not null check (gross_weight_kg > 0),
  collection_cluster text not null,
  request_type public.produce_request_type not null,
  status public.request_status not null default 'pending_pickup',
  created_at timestamptz not null default now()
);

create table public.consumer_orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  consumer_id uuid not null references public.profiles(id),
  pickup_warehouse_id uuid not null references public.warehouses(id),
  total_kg numeric not null check (total_kg > 0),
  total_amount numeric not null check (total_amount >= 0),
  status text not null default 'ready_for_pickup',
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.consumer_orders(id) on delete cascade,
  lot_id uuid not null references public.produce_lots(id),
  quantity_kg numeric not null check (quantity_kg > 0),
  unit_price numeric not null check (unit_price >= 0)
);

create table public.farmer_listings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  crop text not null,
  category text not null,
  description text not null default '',
  quantity_kg numeric not null check (quantity_kg > 0),
  price_per_kg numeric not null check (price_per_kg >= 0),
  image_url text not null,
  status text not null default 'published' check (status in ('published', 'pending', 'rejected')),
  created_at timestamptz not null default now()
);

create table public.bulk_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id),
  buyer_name text not null,
  crop text not null,
  quantity_kg numeric not null check (quantity_kg > 0),
  status text not null default 'pending' check (status in ('pending', 'verified', 'quoted', 'rejected')),
  created_at timestamptz not null default now()
);

create table public.logistics_jobs (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references public.profiles(id),
  source_type text not null,
  source_id uuid,
  details text not null,
  status text not null default 'pending_verification' check (status in ('pending_verification', 'verified', 'scheduled', 'in_transit', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public) values ('produce-photos', 'produce-photos', true)
on conflict (id) do update set public = true;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.warehouses enable row level security;
alter table public.produce_lots enable row level security;
alter table public.produce_requests enable row level security;
alter table public.consumer_orders enable row level security;
alter table public.order_items enable row level security;
alter table public.farmer_listings enable row level security;
alter table public.bulk_requests enable row level security;
alter table public.logistics_jobs enable row level security;

create policy "users read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "users update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "authenticated users read warehouses" on public.warehouses for select using (auth.uid() is not null);
create policy "admins manage warehouses" on public.warehouses for all using (public.is_admin()) with check (public.is_admin());
create policy "authenticated users read lots" on public.produce_lots for select using (auth.uid() is not null);
create policy "admins manage lots" on public.produce_lots for all using (public.is_admin()) with check (public.is_admin());
create policy "farmers create own requests" on public.produce_requests for insert with check (farmer_id = auth.uid());
create policy "farmers read own requests" on public.produce_requests for select using (farmer_id = auth.uid() or public.is_admin());
create policy "admins update requests" on public.produce_requests for update using (public.is_admin()) with check (public.is_admin());
create policy "consumers create own orders" on public.consumer_orders for insert with check (consumer_id = auth.uid());
create policy "consumers read own orders" on public.consumer_orders for select using (consumer_id = auth.uid() or public.is_admin());
create policy "admins update orders" on public.consumer_orders for update using (public.is_admin()) with check (public.is_admin());
create policy "order owners and admins read order items" on public.order_items for select using (exists (select 1 from public.consumer_orders o where o.id = order_id and (o.consumer_id = auth.uid() or public.is_admin())));
create policy "consumers add items to own orders" on public.order_items for insert with check (exists (select 1 from public.consumer_orders o where o.id = order_id and o.consumer_id = auth.uid()));
create policy "anyone reads published farmer listings" on public.farmer_listings for select using (status = 'published' or farmer_id = auth.uid() or public.is_admin());
create policy "farmers create own listings" on public.farmer_listings for insert with check (farmer_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and role = 'farmer'));
create policy "farmers manage own listings" on public.farmer_listings for update using (farmer_id = auth.uid() or public.is_admin()) with check (farmer_id = auth.uid() or public.is_admin());
create policy "farmers delete own listings" on public.farmer_listings for delete using (farmer_id = auth.uid() or public.is_admin());
create policy "buyers create own bulk requests" on public.bulk_requests for insert with check (buyer_id = auth.uid());
create policy "buyers and admins read bulk requests" on public.bulk_requests for select using (buyer_id = auth.uid() or public.is_admin());
create policy "admins verify bulk requests" on public.bulk_requests for update using (public.is_admin()) with check (public.is_admin());
create policy "users create own logistics jobs" on public.logistics_jobs for insert with check (requested_by = auth.uid());
create policy "users and admins read logistics jobs" on public.logistics_jobs for select using (requested_by = auth.uid() or public.is_admin());
create policy "admins verify logistics jobs" on public.logistics_jobs for update using (public.is_admin()) with check (public.is_admin());
create policy "authenticated users upload produce photos" on storage.objects for insert to authenticated with check (bucket_id = 'produce-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "public reads produce photos" on storage.objects for select using (bucket_id = 'produce-photos');
create policy "farmers manage own produce photos" on storage.objects for update to authenticated using (bucket_id = 'produce-photos' and owner_id = auth.uid()) with check (bucket_id = 'produce-photos' and owner_id = auth.uid());
create policy "farmers delete own produce photos" on storage.objects for delete to authenticated using (bucket_id = 'produce-photos' and owner_id = auth.uid());

-- See supabase/migrations/20260914_bulk_negotiation.sql for the MSP-protected bulk negotiation schema.

-- Promote an approved user to admin from SQL Editor only:
-- update public.profiles set role = 'admin' where email = 'your-admin-email@example.com';
