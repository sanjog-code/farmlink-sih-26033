-- Fix mutual RLS infinite recursion between consumer_orders and order_items.
-- By encapsulating cross-table checks in security definer functions, Postgres
-- evaluates each table's RLS check without invoking the other table's RLS recursively.

create or replace function public.is_order_owner_or_admin(p_order_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.consumer_orders o
    where o.id = p_order_id and (o.consumer_id = auth.uid() or public.is_admin())
  );
$$;

revoke all on function public.is_order_owner_or_admin(uuid) from public;
grant execute on function public.is_order_owner_or_admin(uuid) to authenticated;

create or replace function public.farmer_owns_order_lot(p_order_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.order_items item
    join public.produce_lots lot on lot.id = item.lot_id
    where item.order_id = p_order_id and lot.farmer_id = auth.uid()
  );
$$;

revoke all on function public.farmer_owns_order_lot(uuid) from public;
grant execute on function public.farmer_owns_order_lot(uuid) to authenticated;

-- Replace the recursive policies with security definer backed policies
drop policy if exists "farmers read fulfilment orders for own lots" on public.consumer_orders;
create policy "farmers read fulfilment orders for own lots" on public.consumer_orders
  for select using (public.farmer_owns_order_lot(id));

drop policy if exists "order owners and admins read order items" on public.order_items;
create policy "order owners and admins read order items" on public.order_items
  for select using (public.is_order_owner_or_admin(order_id));
