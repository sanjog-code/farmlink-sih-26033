-- Government MSP exists only for notified crops. Other registered crops use an
-- administrator-verified reference floor until an official price is available.
create table if not exists public.crop_price_floors (
  crop text primary key,
  floor_price_per_kg numeric not null check (floor_price_per_kg > 0),
  floor_type text not null default 'admin_verified_reference'
    check (floor_type in ('official_msp', 'admin_verified_reference')),
  source_url text,
  updated_at timestamptz not null default now()
);

alter table public.crop_price_floors enable row level security;
drop policy if exists "authenticated users read crop price floors" on public.crop_price_floors;
drop policy if exists "admins manage crop price floors" on public.crop_price_floors;
create policy "authenticated users read crop price floors" on public.crop_price_floors for select using (auth.uid() is not null);
create policy "admins manage crop price floors" on public.crop_price_floors for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.get_crop_price_floor(p_crop text)
returns numeric language plpgsql stable security definer set search_path=public as $$
declare floor_price numeric;
begin
  select msp_per_kg into floor_price from public.msp_rates where crop = p_crop;
  if floor_price is null then
    select floor_price_per_kg into floor_price from public.crop_price_floors where crop = p_crop;
  end if;
  if floor_price is null or floor_price <= 0 then
    raise exception 'No verified MSP or price floor is configured for %. Ask an administrator to configure it before listing or quoting.', p_crop;
  end if;
  return floor_price;
end; $$;

create or replace function public.enforce_listing_price_floor()
returns trigger language plpgsql security definer set search_path=public as $$
declare floor_price numeric;
begin
  floor_price := public.get_crop_price_floor(new.crop);
  if new.price_per_kg < floor_price then
    raise exception 'Price for % cannot be below its verified floor of ₹%/kg', new.crop, floor_price;
  end if;
  return new;
end; $$;

drop trigger if exists farmer_listing_price_floor_guard on public.farmer_listings;
create trigger farmer_listing_price_floor_guard before insert or update of crop, price_per_kg on public.farmer_listings
  for each row execute procedure public.enforce_listing_price_floor();

drop trigger if exists produce_lot_price_floor_guard on public.produce_lots;
create trigger produce_lot_price_floor_guard before insert or update of crop, price_per_kg on public.produce_lots
  for each row execute procedure public.enforce_listing_price_floor();

create or replace function public.enforce_bulk_quote_msp()
returns trigger language plpgsql security definer set search_path=public as $$
declare floor_price numeric;
begin
  select public.get_crop_price_floor(crop) into floor_price from public.bulk_requests where id = new.request_id;
  if floor_price is null then raise exception 'Bulk request does not exist'; end if;
  new.msp_per_kg := floor_price;
  if new.offered_price_per_kg < new.msp_per_kg then
    raise exception 'Offer is below the applicable verified floor of % per kg', new.msp_per_kg;
  end if;
  return new;
end; $$;

create or replace function public.set_bulk_request_price_floor()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  new.msp_per_kg := public.get_crop_price_floor(new.crop);
  return new;
end; $$;

drop trigger if exists bulk_request_price_floor_guard on public.bulk_requests;
create trigger bulk_request_price_floor_guard before insert or update of crop on public.bulk_requests
  for each row execute procedure public.set_bulk_request_price_floor();
