create or replace function public.cancel_consumer_order(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare order_row public.consumer_orders%rowtype; item public.order_items%rowtype;
begin
  select * into order_row from public.consumer_orders where id = p_order_id for update;
  if order_row.id is null or order_row.consumer_id <> auth.uid() then raise exception 'You cannot cancel this order'; end if;
  if order_row.status <> 'pending_verification' or order_row.cancellation_expires_at <= now() then raise exception 'The cancellation window has closed'; end if;
  for item in select * from public.order_items where order_id = p_order_id loop
    update public.produce_lots set quantity_kg = quantity_kg + item.quantity_kg where id = item.lot_id;
  end loop;
  update public.consumer_orders set status = 'cancelled' where id = p_order_id;
end; $$;

create or replace function public.admin_set_consumer_order_status(p_order_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Administrator access is required'; end if;
  if p_status not in ('verified','confirmed','ready_for_pickup','completed','cancelled') then raise exception 'Unsupported order status'; end if;
  update public.consumer_orders set status = p_status where id = p_order_id;
  if not found then raise exception 'Order not found'; end if;
end; $$;

revoke all on function public.cancel_consumer_order(uuid) from public;
revoke all on function public.admin_set_consumer_order_status(uuid, text) from public;
grant execute on function public.cancel_consumer_order(uuid) to authenticated;
grant execute on function public.admin_set_consumer_order_status(uuid, text) to authenticated;
