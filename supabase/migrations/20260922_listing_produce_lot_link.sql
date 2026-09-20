alter table public.farmer_listings
  add column if not exists produce_lot_id uuid references public.produce_lots(id);
