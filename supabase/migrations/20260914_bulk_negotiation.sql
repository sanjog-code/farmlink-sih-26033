-- Farmer-controlled 250 kg+ bulk negotiation with an MSP floor.
alter table public.bulk_requests add column if not exists farmer_id uuid references public.profiles(id);
alter table public.bulk_requests add column if not exists listing_id uuid references public.farmer_listings(id);
alter table public.bulk_requests add column if not exists msp_per_kg numeric not null default 0 check (msp_per_kg >= 0);
alter table public.bulk_requests add column if not exists agreed_price_per_kg numeric check (agreed_price_per_kg >= 0);
alter table public.bulk_requests drop constraint if exists bulk_requests_quantity_kg_check;
alter table public.bulk_requests drop constraint if exists bulk_requests_min_quantity;
alter table public.bulk_requests add constraint bulk_requests_min_quantity check (quantity_kg >= 250) not valid;
alter table public.bulk_requests drop constraint if exists bulk_requests_status_check;
alter table public.bulk_requests add constraint bulk_requests_status_check check (status in ('pending', 'verified', 'quoted', 'rejected', 'negotiation', 'countered', 'confirmed', 'declined'));

create table if not exists public.msp_rates (
  crop text primary key,
  msp_per_kg numeric not null check (msp_per_kg > 0),
  marketing_season text not null,
  source_url text not null,
  updated_at timestamptz not null default now()
);

insert into public.msp_rates(crop,msp_per_kg,marketing_season,source_url) values
  ('Wheat',25.85,'RMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2197711&reg=3&lang=2'),
  ('Barley',21.50,'RMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2197711&reg=3&lang=2'),
  ('Chickpea (Gram)',58.75,'RMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2197711&reg=3&lang=2'),
  ('Lentil (Masur)',70.00,'RMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2197711&reg=3&lang=2'),
  ('Rapeseed & mustard',62.00,'RMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2197711&reg=3&lang=2'),
  ('Safflower',65.40,'RMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2197711&reg=3&lang=2'),
  ('Maize',24.00,'KMS 2025-26','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2152556&reg=3&lang=2'),
  ('Rice',24.41,'KMS 2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202665884101.pdf'),
  ('Paddy (Common)',24.41,'KMS 2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202665884101.pdf'),
  ('Pearl millet (Bajra)',29.25,'KMS 2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202665884101.pdf'),
  ('Finger millet (Ragi)',52.05,'KMS 2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202665884101.pdf'),
  ('Sorghum (Jowar)',40.23,'KMS 2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202665884101.pdf'),
  ('Pigeon pea (Arhar/Tur)',82.50,'KMS 2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202665884101.pdf'),
  ('Green gram (Moong)',90.10,'KMS 2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202665884101.pdf'),
  ('Black gram (Urad)',82.50,'KMS 2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202665884101.pdf'),
  ('Groundnut',79.26,'KMS 2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202665884101.pdf'),
  ('Sesame',103.46,'KMS 2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202665884101.pdf'),
  ('Sesame (Til)',103.46,'KMS 2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202665884101.pdf'),
  ('Sunflower',83.43,'KMS 2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202665884101.pdf'),
  ('Soybean',53.28,'KMS 2025-26','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2152556&reg=3&lang=2'),
  ('Cotton',82.67,'KMS 2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202665884101.pdf'),
  ('Jute',59.25,'2026-27','https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/feb/doc2026225805101.pdf')
on conflict (crop) do update set msp_per_kg=excluded.msp_per_kg,marketing_season=excluded.marketing_season,source_url=excluded.source_url,updated_at=now();

create table if not exists public.bulk_quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.bulk_requests(id) on delete cascade,
  offered_price_per_kg numeric not null check (offered_price_per_kg > 0),
  msp_per_kg numeric not null default 0 check (msp_per_kg >= 0),
  proposed_by text not null check (proposed_by in ('buyer','farmer')),
  status text not null default 'proposed' check (status in ('proposed','accepted','rejected','withdrawn')),
  created_at timestamptz not null default now()
);

create or replace function public.enforce_bulk_quote_msp()
returns trigger language plpgsql security definer set search_path=public as $$
declare request_crop text; floor_price numeric;
begin
  select crop into request_crop from public.bulk_requests where id=new.request_id;
  if request_crop is null then raise exception 'Bulk request does not exist'; end if;
  select msp_per_kg into floor_price from public.msp_rates where crop=request_crop;
  new.msp_per_kg:=coalesce(floor_price,0);
  if new.offered_price_per_kg < new.msp_per_kg then
    raise exception 'Offer is below the applicable MSP floor of % per kg',new.msp_per_kg;
  end if;
  return new;
end; $$;

drop trigger if exists bulk_quote_msp_guard on public.bulk_quotes;
create trigger bulk_quote_msp_guard before insert or update on public.bulk_quotes for each row execute procedure public.enforce_bulk_quote_msp();

alter table public.msp_rates enable row level security;
alter table public.bulk_quotes enable row level security;
drop policy if exists "buyers and admins read bulk requests" on public.bulk_requests;
drop policy if exists "admins verify bulk requests" on public.bulk_requests;
drop policy if exists "participants and admins read bulk requests" on public.bulk_requests;
drop policy if exists "admins manage bulk requests" on public.bulk_requests;
drop policy if exists "buyers create bulk requests" on public.bulk_requests;
drop policy if exists "participants read bulk quotes" on public.bulk_quotes;
drop policy if exists "participants create bulk quotes" on public.bulk_quotes;
drop policy if exists "admins manage bulk quotes" on public.bulk_quotes;
drop policy if exists "authenticated users read msp rates" on public.msp_rates;
create policy "participants and admins read bulk requests" on public.bulk_requests for select using (buyer_id=auth.uid() or farmer_id=auth.uid() or public.is_admin());
create policy "admins manage bulk requests" on public.bulk_requests for update using (public.is_admin()) with check (public.is_admin());
create policy "buyers create bulk requests" on public.bulk_requests for insert with check (buyer_id=auth.uid());
create policy "participants read bulk quotes" on public.bulk_quotes for select using (exists(select 1 from public.bulk_requests r where r.id=request_id and (r.buyer_id=auth.uid() or r.farmer_id=auth.uid() or public.is_admin())));
create policy "participants create bulk quotes" on public.bulk_quotes for insert with check (exists(select 1 from public.bulk_requests r where r.id=request_id and ((r.buyer_id=auth.uid() and proposed_by='buyer') or (r.farmer_id=auth.uid() and proposed_by='farmer') or public.is_admin())));
create policy "admins manage bulk quotes" on public.bulk_quotes for update using (public.is_admin()) with check (public.is_admin());
create policy "authenticated users read msp rates" on public.msp_rates for select using (auth.uid() is not null);

create or replace function public.respond_to_bulk_quote(p_request_id uuid,p_quote_id uuid,p_action text)
returns text language plpgsql security definer set search_path=public as $$
declare req public.bulk_requests%rowtype; offer public.bulk_quotes%rowtype;
begin
  select * into req from public.bulk_requests where id=p_request_id for update;
  if req.id is null or req.farmer_id<>auth.uid() then raise exception 'Only the assigned farmer can decide this sale'; end if;
  select * into offer from public.bulk_quotes where id=p_quote_id and request_id=p_request_id for update;
  if offer.id is null or offer.status<>'proposed' then raise exception 'This quote is no longer available'; end if;
  if p_action='accept' then
    update public.bulk_quotes set status='accepted' where id=p_quote_id;
    update public.bulk_quotes set status='rejected' where request_id=p_request_id and id<>p_quote_id and status='proposed';
    update public.bulk_requests set status='confirmed',agreed_price_per_kg=offer.offered_price_per_kg where id=p_request_id;
    return 'confirmed';
  elsif p_action='reject' then
    update public.bulk_quotes set status='rejected' where id=p_quote_id;
    update public.bulk_requests set status='declined' where id=p_request_id;
    return 'declined';
  end if;
  raise exception 'Unknown bulk quote response';
end; $$;
grant execute on function public.respond_to_bulk_quote(uuid,uuid,text) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_rel relation
    join pg_publication publication on publication.oid = relation.prpubid
    where publication.pubname = 'supabase_realtime'
      and relation.prrelid = 'public.bulk_quotes'::regclass
  ) then
    alter publication supabase_realtime add table public.bulk_quotes;
  end if;
end $$;
