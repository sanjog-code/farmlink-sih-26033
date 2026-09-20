-- Preserve traceability while allowing administrators to safely remove a listing from the marketplace.
alter table public.farmer_listings
  add column if not exists harvest_date date;
alter table public.produce_lots
  add column if not exists marketplace_visible boolean not null default true;

alter table public.farmer_listings drop constraint if exists farmer_listings_status_check;
alter table public.farmer_listings add constraint farmer_listings_status_check
  check (status in ('pending', 'scheduled', 'published', 'rejected', 'removed'));

create or replace function public.validate_listing_harvest_date()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.harvest_date is null then raise exception 'Harvest date is required for every produce listing'; end if;
  if new.harvest_date > current_date then raise exception 'Harvest date cannot be in the future'; end if;
  return new;
end; $$;

drop trigger if exists farmer_listing_harvest_date_guard on public.farmer_listings;
create trigger farmer_listing_harvest_date_guard before insert on public.farmer_listings
  for each row execute procedure public.validate_listing_harvest_date();

create or replace function public.remove_marketplace_listing(p_listing_id uuid)
returns text language plpgsql security definer set search_path=public as $$
declare lot_id uuid;
begin
  if not public.is_admin() then raise exception 'Administrator access is required'; end if;
  select produce_lot_id into lot_id from public.farmer_listings where id = p_listing_id for update;
  if not found then raise exception 'Listing not found'; end if;
  update public.farmer_listings set status = 'removed' where id = p_listing_id;
  if lot_id is not null then update public.produce_lots set marketplace_visible = false where id = lot_id; end if;
  return 'removed';
end; $$;
grant execute on function public.remove_marketplace_listing(uuid) to authenticated;
