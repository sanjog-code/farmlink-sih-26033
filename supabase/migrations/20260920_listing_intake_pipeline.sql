-- Farmer photo listing → admin scheduling → warehouse photo/AI grade → marketplace.
alter table public.farmer_listings
  add column if not exists intake_warehouse_id uuid references public.warehouses(id),
  add column if not exists produce_lot_id uuid references public.produce_lots(id),
  add column if not exists warehouse_image_url text,
  add column if not exists warehouse_grade text,
  add column if not exists grading_confidence numeric check (grading_confidence >= 0 and grading_confidence <= 100),
  add column if not exists scheduled_at timestamptz,
  add column if not exists intake_confirmed_at timestamptz;

alter table public.farmer_listings
  drop constraint if exists farmer_listings_status_check;
alter table public.farmer_listings
  add constraint farmer_listings_status_check
  check (status in ('pending', 'scheduled', 'published', 'rejected'));

create index if not exists farmer_listings_intake_queue_idx
  on public.farmer_listings (intake_warehouse_id, status, created_at desc);

do $$
begin
  if not exists (
    select 1 from pg_publication_rel relation
    join pg_publication publication on publication.oid = relation.prpubid
    where publication.pubname = 'supabase_realtime'
      and relation.prrelid = 'public.farmer_listings'::regclass
  ) then
    alter publication supabase_realtime add table public.farmer_listings;
  end if;
end $$;
