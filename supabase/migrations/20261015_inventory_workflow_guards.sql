-- One authoritative catalogue: quantities/prices come from current warehouse lots.
alter table public.farmer_listings add column if not exists grading_report_id uuid references public.ai_grading_reports(id);
create or replace function public.get_marketplace_inventory()
returns table(id uuid,produce_lot_id uuid,crop text,category text,description text,quantity_kg numeric,price_per_kg numeric,
  image_url text,image_urls text[],warehouse_image_url text,warehouse_grade text,grading_confidence numeric,
  harvest_date date,created_at timestamptz,warehouse_name text,farmer_name text)
language sql stable security definer set search_path=public,pg_temp as $$
  select f.id,l.id,f.crop,f.category,f.description,l.quantity_kg,l.price_per_kg,f.image_url,f.image_urls,
    f.warehouse_image_url,l.grade,null::numeric,f.harvest_date,f.created_at,w.name,p.full_name
  from public.farmer_listings f join public.produce_lots l on l.id=f.produce_lot_id
  join public.warehouses w on w.id=l.warehouse_id join public.profiles p on p.id=f.farmer_id
  where f.status='published' and l.marketplace_visible and l.quantity_kg>0 and w.active and p.role='farmer'
  order by f.created_at desc;
$$;
revoke all on function public.get_marketplace_inventory() from public;
grant execute on function public.get_marketplace_inventory() to anon,authenticated;

create or replace function public.complete_listing_intake(p_listing_id uuid,p_grade text,p_photo_path text,p_quantity_kg numeric,p_report_id uuid default null)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare listing public.farmer_listings; lot_id uuid;
begin
  if not coalesce(public.is_admin(),false) then raise exception 'Administrator access required'; end if;
  select * into listing from public.farmer_listings where id=p_listing_id for update;
  if listing.id is null then raise exception 'Listing not found'; end if;
  if listing.status='published' and listing.produce_lot_id is not null then return listing.produce_lot_id; end if;
  if listing.status<>'scheduled' then raise exception 'Schedule this listing before intake'; end if;
  if p_grade is null or p_grade not in ('A','B','C') or p_quantity_kg is null or p_quantity_kg<=0 or p_quantity_kg>10000000 then raise exception 'Confirm a valid grade and measured weight'; end if;
  if not exists(select 1 from public.warehouses where id=listing.intake_warehouse_id and active) then raise exception 'Select an active warehouse'; end if;
  if p_photo_path is null or p_photo_path not like auth.uid()::text||'/warehouse-intake/%' or not exists(select 1 from storage.objects where bucket_id='produce-photos' and name=p_photo_path) then raise exception 'Upload the warehouse photo before confirming intake'; end if;
  if p_report_id is not null and not exists(select 1 from public.ai_grading_reports where id=p_report_id and listing_id=p_listing_id and crop=listing.crop and created_by=auth.uid()) then raise exception 'Photo report does not match this intake'; end if;
  insert into public.produce_lots(lot_code,farmer_id,crop,grade,quantity_kg,price_per_kg,warehouse_id,marketplace_visible)
  values('FL-'||upper(substr(gen_random_uuid()::text,1,12)),listing.farmer_id,listing.crop,p_grade,p_quantity_kg,listing.price_per_kg,listing.intake_warehouse_id,true) returning id into lot_id;
  update public.farmer_listings set status='published',produce_lot_id=lot_id,warehouse_grade=p_grade,
    quantity_kg=p_quantity_kg,warehouse_image_url='https://neoyrdfpvnfsnxwjbthm.supabase.co/storage/v1/object/public/produce-photos/'||p_photo_path,
    grading_confidence=null,grading_report_id=p_report_id,intake_confirmed_at=now(),reviewed_at=now() where id=p_listing_id;
  return lot_id;
end $$;
revoke all on function public.complete_listing_intake(uuid,text,text,numeric,uuid) from public,anon;
grant execute on function public.complete_listing_intake(uuid,text,text,numeric,uuid) to authenticated;

-- Validate all lines and lock them in a stable order; only published stock can sell.
create or replace function public.place_consumer_order(p_order_code text,p_warehouse_id uuid,p_items jsonb,p_cancellation_expires_at timestamptz)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare item record; lot public.produce_lots; created_order uuid; total_kg numeric:=0; total_amount numeric:=0;
begin
  if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='consumer') then raise exception 'Sign in as a consumer before placing an order'; end if;
  if p_order_code is null or length(p_order_code) not between 5 and 80 then raise exception 'Invalid order reference'; end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text||p_order_code));
  select id into created_order from public.consumer_orders where order_code=p_order_code and consumer_id=auth.uid();
  if created_order is not null then return created_order; end if;
  if not exists(select 1 from public.warehouses where id=p_warehouse_id and active) then raise exception 'Select an active pickup warehouse'; end if;
  if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 100 then raise exception 'Your cart is empty or invalid'; end if;
  if exists(select 1 from jsonb_array_elements(p_items) i where (i->>'quantityKg') is null or (i->>'lotId') is null or (i->>'quantityKg')::numeric<=0 or (i->>'quantityKg')::numeric>50) then raise exception 'Each quantity must be positive and no greater than 50 kg'; end if;
  for item in select (i->>'lotId')::uuid as lot_id,sum((i->>'quantityKg')::numeric) as kg from jsonb_array_elements(p_items) i group by 1 order by 1 loop
    select * into lot from public.produce_lots where id=item.lot_id for update;
    if lot.id is null or not lot.marketplace_visible or not exists(select 1 from public.farmer_listings f join public.profiles p on p.id=f.farmer_id where f.produce_lot_id=lot.id and f.status='published' and p.role='farmer') then raise exception 'A cart item is no longer available'; end if;
    if lot.quantity_kg<item.kg then raise exception 'Only % kg remains for %',lot.quantity_kg,lot.crop; end if;
    total_kg:=total_kg+item.kg; total_amount:=total_amount+item.kg*lot.price_per_kg;
  end loop;
  if total_kg>50 then raise exception 'Consumer orders are limited to 50 kg'; end if;
  insert into public.consumer_orders(order_code,consumer_id,pickup_warehouse_id,total_kg,total_amount,status,cancellation_expires_at)
  values(p_order_code,auth.uid(),p_warehouse_id,total_kg,total_amount,'pending_verification',now()+interval '10 minutes') returning id into created_order;
  for item in select (i->>'lotId')::uuid as lot_id,sum((i->>'quantityKg')::numeric) as kg from jsonb_array_elements(p_items) i group by 1 order by 1 loop
    select * into lot from public.produce_lots where id=item.lot_id;
    insert into public.order_items(order_id,lot_id,quantity_kg,unit_price) values(created_order,lot.id,item.kg,lot.price_per_kg);
    update public.produce_lots set quantity_kg=quantity_kg-item.kg where id=lot.id;
  end loop;
  return created_order;
end $$;
revoke all on function public.place_consumer_order(text,uuid,jsonb,timestamptz) from public,anon;
grant execute on function public.place_consumer_order(text,uuid,jsonb,timestamptz) to authenticated;

create or replace function public.admin_set_consumer_order_status(p_order_id uuid,p_status text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare order_row public.consumer_orders; item record;
begin
  if not coalesce(public.is_admin(),false) then raise exception 'Administrator access required'; end if;
  select * into order_row from public.consumer_orders where id=p_order_id for update;
  if order_row.id is null then raise exception 'Order not found'; end if;
  if order_row.status=p_status then return; end if;
  if order_row.status in ('cancelled','completed') then raise exception 'This order is already closed'; end if;
  if order_row.status='pending_verification' and order_row.cancellation_expires_at>now() then raise exception 'Wait for consumer confirmation or the cancellation timer to finish'; end if;
  if p_status='cancelled' then
    for item in select * from public.order_items where order_id=p_order_id order by lot_id loop
      update public.produce_lots set quantity_kg=quantity_kg+item.quantity_kg where id=item.lot_id;
    end loop;
  elsif not ((p_status in ('confirmed','verified') and order_row.status in ('pending_verification','confirmed')) or
    (p_status='ready_for_pickup' and order_row.status in ('confirmed','verified')) or
    (p_status='completed' and order_row.status='ready_for_pickup')) then raise exception 'This order transition is not available'; end if;
  update public.consumer_orders set status=p_status,cancellation_expires_at=null where id=p_order_id;
end $$;

-- Public callers must not invoke owner-only operations with a null identity.
revoke all on function public.confirm_consumer_order_now(uuid) from public,anon;
revoke all on function public.confirm_expired_consumer_order(uuid) from public,anon;
revoke all on function public.confirm_consumer_order_collection(uuid) from public,anon;
revoke all on function public.expire_consumer_cancellation_windows() from public,anon;
grant execute on function public.confirm_consumer_order_now(uuid),public.confirm_expired_consumer_order(uuid),public.confirm_consumer_order_collection(uuid),public.expire_consumer_cancellation_windows() to authenticated;
