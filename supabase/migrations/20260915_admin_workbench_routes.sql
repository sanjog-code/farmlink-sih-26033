-- Admin moderation workbench and end-to-end logistics map.
alter table public.farmer_listings alter column status set default 'pending';
alter table public.farmer_listings add column if not exists reviewed_at timestamptz;
alter table public.farmer_listings add column if not exists review_notes text;

drop policy if exists "farmers manage own listings" on public.farmer_listings;
create policy "farmers amend pending listings" on public.farmer_listings for update
  using (farmer_id=auth.uid() and status='pending')
  with check (farmer_id=auth.uid() and status='pending');
create policy "admins moderate listings" on public.farmer_listings for update
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.logistics_routes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.logistics_jobs(id) on delete set null,
  created_by uuid not null references public.profiles(id),
  route_type text not null check (route_type in ('farmer_to_warehouse','inter_warehouse','warehouse_to_consumer','warehouse_to_buyer')),
  origin text not null,
  destination text not null,
  stops jsonb not null default '[]'::jsonb,
  status text not null default 'planned' check (status in ('planned','assigned','in_transit','completed','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.logistics_routes enable row level security;
create policy "route creator or admin reads routes" on public.logistics_routes for select using (created_by=auth.uid() or public.is_admin());
create policy "users create own routes" on public.logistics_routes for insert with check (created_by=auth.uid());
create policy "admins manage routes" on public.logistics_routes for update using (public.is_admin()) with check (public.is_admin());
alter publication supabase_realtime add table public.farmer_listings;
alter publication supabase_realtime add table public.logistics_routes;
