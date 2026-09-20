-- Quotes may be assigned only to farmers with live stock of the requested crop.
-- A cluster records the participating farmers and their allocated quantities.
create table if not exists public.bulk_request_farmers (
  request_id uuid not null references public.bulk_requests(id) on delete cascade,
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  allocated_quantity_kg numeric not null check (allocated_quantity_kg > 0),
  created_at timestamptz not null default now(),
  primary key (request_id, farmer_id)
);

alter table public.bulk_request_farmers enable row level security;
drop policy if exists "admins and allocated farmers read bulk clusters" on public.bulk_request_farmers;
create policy "admins and allocated farmers read bulk clusters" on public.bulk_request_farmers
  for select using (public.is_admin() or farmer_id = auth.uid());

create or replace function public.assign_bulk_request_farmer(p_request_id uuid, p_farmer_id uuid)
returns text language plpgsql security definer set search_path=public as $$
declare req public.bulk_requests%rowtype; available_kg numeric;
begin
  if not public.is_admin() then raise exception 'Administrator access is required'; end if;
  select * into req from public.bulk_requests where id = p_request_id for update;
  if req.id is null then raise exception 'Bulk request does not exist'; end if;
  select coalesce(sum(quantity_kg), 0) into available_kg
    from public.produce_lots where farmer_id = p_farmer_id and crop = req.crop and quantity_kg > 0;
  if available_kg < req.quantity_kg then
    raise exception 'This farmer has only % kg of % available; the request needs % kg', available_kg, req.crop, req.quantity_kg;
  end if;
  delete from public.bulk_request_farmers where request_id = p_request_id;
  insert into public.bulk_request_farmers(request_id, farmer_id, allocated_quantity_kg)
    values (p_request_id, p_farmer_id, req.quantity_kg);
  update public.bulk_requests set farmer_id = p_farmer_id, status = 'negotiation' where id = p_request_id;
  return 'assigned';
end; $$;

create or replace function public.assign_bulk_request_cluster(p_request_id uuid, p_allocations jsonb)
returns text language plpgsql security definer set search_path=public as $$
declare req public.bulk_requests%rowtype; entry jsonb; chosen_farmer uuid; allocation_kg numeric;
  available_kg numeric; allocated_total numeric := 0; lead_farmer uuid; participant_count integer := 0;
begin
  if not public.is_admin() then raise exception 'Administrator access is required'; end if;
  if jsonb_typeof(p_allocations) <> 'array' or jsonb_array_length(p_allocations) < 2 then
    raise exception 'Select at least two farmers to create a cluster';
  end if;
  select * into req from public.bulk_requests where id = p_request_id for update;
  if req.id is null then raise exception 'Bulk request does not exist'; end if;
  if exists (select 1 from jsonb_array_elements(p_allocations) item group by item->>'farmer_id' having count(*) > 1) then
    raise exception 'A farmer can appear only once in a cluster';
  end if;
  for entry in select * from jsonb_array_elements(p_allocations) loop
    chosen_farmer := (entry->>'farmer_id')::uuid;
    allocation_kg := (entry->>'allocated_quantity_kg')::numeric;
    if allocation_kg is null or allocation_kg <= 0 then raise exception 'Each cluster allocation must be greater than zero'; end if;
    select coalesce(sum(quantity_kg), 0) into available_kg
      from public.produce_lots where farmer_id = chosen_farmer and crop = req.crop and quantity_kg > 0;
    if available_kg < allocation_kg then
      raise exception 'A selected farmer does not have the allocated % kg of % in live stock', allocation_kg, req.crop;
    end if;
    allocated_total := allocated_total + allocation_kg;
    participant_count := participant_count + 1;
    if lead_farmer is null then lead_farmer := chosen_farmer; end if;
  end loop;
  if allocated_total < req.quantity_kg then
    raise exception 'Cluster capacity is % kg; the request needs % kg', allocated_total, req.quantity_kg;
  end if;
  delete from public.bulk_request_farmers where request_id = p_request_id;
  insert into public.bulk_request_farmers(request_id, farmer_id, allocated_quantity_kg)
    select p_request_id, (item->>'farmer_id')::uuid, (item->>'allocated_quantity_kg')::numeric
    from jsonb_array_elements(p_allocations) item;
  update public.bulk_requests set farmer_id = lead_farmer, status = 'negotiation' where id = p_request_id;
  return 'clustered';
end; $$;

grant execute on function public.assign_bulk_request_farmer(uuid,uuid) to authenticated;
grant execute on function public.assign_bulk_request_cluster(uuid,jsonb) to authenticated;

do $$ begin
  if not exists (select 1 from pg_publication_rel relation join pg_publication publication on publication.oid = relation.prpubid where publication.pubname = 'supabase_realtime' and relation.prrelid = 'public.bulk_request_farmers'::regclass) then
    alter publication supabase_realtime add table public.bulk_request_farmers;
  end if;
end $$;
