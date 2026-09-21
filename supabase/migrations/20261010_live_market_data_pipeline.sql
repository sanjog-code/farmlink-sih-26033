-- Daily mandi-market observations are distinct from seasonal Government MSP.
create table if not exists public.market_price_snapshots (
  id uuid primary key default gen_random_uuid(),
  crop text not null,
  market text not null,
  district text,
  state text,
  variety text,
  price_date date not null,
  min_price_per_kg numeric check (min_price_per_kg >= 0),
  modal_price_per_kg numeric not null check (modal_price_per_kg >= 0),
  max_price_per_kg numeric check (max_price_per_kg >= 0),
  arrivals_tonnes numeric check (arrivals_tonnes >= 0),
  source_name text not null default 'data.gov.in / AGMARKNET',
  source_record jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  unique(crop, market, state, price_date)
);

create table if not exists public.market_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  status text not null check (status in ('running','succeeded','failed','partial')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  records_received integer not null default 0,
  records_written integer not null default 0,
  details text
);

create index if not exists market_price_snapshots_crop_date_idx on public.market_price_snapshots(crop, price_date desc);
alter table public.market_price_snapshots enable row level security;
alter table public.market_sync_runs enable row level security;
drop policy if exists "authenticated users read market prices" on public.market_price_snapshots;
drop policy if exists "admins read market sync runs" on public.market_sync_runs;
create policy "authenticated users read market prices" on public.market_price_snapshots for select using (auth.uid() is not null);
create policy "admins read market sync runs" on public.market_sync_runs for select using (public.is_admin());

do $$ begin
  if not exists (select 1 from pg_publication_rel r join pg_publication p on p.oid = r.prpubid where p.pubname = 'supabase_realtime' and r.prrelid = 'public.market_price_snapshots'::regclass) then
    alter publication supabase_realtime add table public.market_price_snapshots;
  end if;
end $$;
