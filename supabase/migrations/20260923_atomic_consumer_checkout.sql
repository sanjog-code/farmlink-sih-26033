create or replace function public.place_consumer_order(
  p_order_code text,
  p_warehouse_id uuid,
  p_items jsonb,
  p_cancellation_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  lot public.produce_lots%rowtype;
  created_order uuid;
  requested_kg numeric;
  total_kg numeric := 0;
  total_amount numeric := 0;
begin
  if auth.uid() is null then raise exception 'Sign in before placing an order'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'consumer') then
    raise exception 'Only consumer accounts can place marketplace orders';
  end if;
  if not exists (select 1 from public.warehouses where id = p_warehouse_id and active = true) then
    raise exception 'Select an active pickup warehouse';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty';
  end if;

  for item in select value from jsonb_array_elements(p_items) loop
    requested_kg := (item->>'quantityKg')::numeric;
    if requested_kg is null or requested_kg <= 0 then raise exception 'Each cart quantity must be positive'; end if;
    select * into lot from public.produce_lots where id = (item->>'lotId')::uuid for update;
    if lot.id is null then raise exception 'A cart item is no longer available'; end if;
    if lot.quantity_kg < requested_kg then raise exception 'Only % kg remains in one of your selected lots', lot.quantity_kg; end if;
    total_kg := total_kg + requested_kg;
    total_amount := total_amount + requested_kg * lot.price_per_kg;
  end loop;
  if total_kg > 50 then raise exception 'Consumer orders are limited to 50 kg'; end if;

  insert into public.consumer_orders(order_code, consumer_id, pickup_warehouse_id, total_kg, total_amount, status, cancellation_expires_at)
  values (p_order_code, auth.uid(), p_warehouse_id, total_kg, total_amount, 'pending_verification', p_cancellation_expires_at)
  returning id into created_order;

  for item in select value from jsonb_array_elements(p_items) loop
    requested_kg := (item->>'quantityKg')::numeric;
    select * into lot from public.produce_lots where id = (item->>'lotId')::uuid for update;
    insert into public.order_items(order_id, lot_id, quantity_kg, unit_price)
    values (created_order, lot.id, requested_kg, lot.price_per_kg);
    update public.produce_lots set quantity_kg = quantity_kg - requested_kg where id = lot.id;
  end loop;
  return created_order;
end;
$$;

revoke all on function public.place_consumer_order(text, uuid, jsonb, timestamptz) from public;
grant execute on function public.place_consumer_order(text, uuid, jsonb, timestamptz) to authenticated;
