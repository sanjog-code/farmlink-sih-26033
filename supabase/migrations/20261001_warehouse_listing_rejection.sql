alter table public.farmer_listings
  add column if not exists warehouse_rejection_reason text,
  add column if not exists warehouse_rejected_at timestamptz;
