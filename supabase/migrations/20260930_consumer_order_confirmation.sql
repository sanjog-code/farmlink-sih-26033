-- Consumer-controlled confirmation persists the order and closes the cancellation window.
create or replace function public.confirm_consumer_order_now(p_order_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare order_row public.consumer_orders%rowtype;
begin
  select * into order_row from public.consumer_orders where id = p_order_id for update;
  if order_row.id is null or order_row.consumer_id <> auth.uid() then raise exception 'You cannot confirm this order'; end if;
  if order_row.status <> 'pending_verification' then raise exception 'Only an order in its cancellation window can be confirmed now'; end if;
  update public.consumer_orders set status = 'confirmed', cancellation_expires_at = null where id = p_order_id;
end; $$;

create or replace function public.confirm_expired_consumer_order(p_order_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare order_row public.consumer_orders%rowtype;
begin
  select * into order_row from public.consumer_orders where id = p_order_id for update;
  if order_row.id is null or order_row.consumer_id <> auth.uid() then raise exception 'You cannot finalize this order'; end if;
  if order_row.status <> 'pending_verification' or order_row.cancellation_expires_at > now() then raise exception 'The cancellation period is still active'; end if;
  update public.consumer_orders set status = 'confirmed', cancellation_expires_at = null where id = p_order_id;
end; $$;

grant execute on function public.confirm_consumer_order_now(uuid) to authenticated;
grant execute on function public.confirm_expired_consumer_order(uuid) to authenticated;
