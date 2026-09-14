-- Run in Supabase SQL Editor after creating a project. Enable RLS before accepting real users.
create table if not exists farmer_profiles (id uuid primary key, name text not null, phone text, village text, language text default 'hi');
create table if not exists produce_lots (id uuid primary key default gen_random_uuid(), farmer_id uuid, crop text not null, grade text not null, quantity_kg numeric not null check (quantity_kg >= 0), price_per_kg numeric not null, warehouse text not null, received_at timestamptz default now());
create table if not exists inventory_events (id uuid primary key default gen_random_uuid(), lot_id uuid references produce_lots(id), event_type text not null, quantity_kg numeric not null, actor_id uuid, reason text, created_at timestamptz default now());
alter table farmer_profiles enable row level security;
alter table produce_lots enable row level security;
alter table inventory_events enable row level security;
-- Add production policies after wiring Supabase Auth: farmers can access their own lots; operators only assigned warehouses; never use service-role keys in the browser.
