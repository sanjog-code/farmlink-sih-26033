-- A single admin-only feed prevents nested RLS joins from hiding new orders
-- from the operations dashboard. Consumer contact details are never exposed to
-- non-admin users.
create or replace function public.get_admin_consumer_orders()
returns table (
  id uuid,
  order_code text,
  total_kg numeric,
  total_amount numeric,
  status text,
  cancellation_expires_at timestamptz,
  created_at timestamptz,
  warehouse_name text,
  consumer_name text,
  consumer_address text,
  consumer_mobile text
)
language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required';
  end if;

  return query
  select o.id, o.order_code, o.total_kg, o.total_amount, o.status,
         o.cancellation_expires_at, o.created_at, w.name,
         p.full_name, p.address, p.mobile
  from public.consumer_orders o
  join public.warehouses w on w.id = o.pickup_warehouse_id
  join public.profiles p on p.id = o.consumer_id
  order by o.created_at desc;
end; $$;

revoke all on function public.get_admin_consumer_orders() from public;
grant execute on function public.get_admin_consumer_orders() to authenticated;
