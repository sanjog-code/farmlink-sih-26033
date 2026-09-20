-- Let farmers see only orders and logistics work connected to their own produce.
drop policy if exists "farmers read fulfilment orders for own lots" on public.consumer_orders;
create policy "farmers read fulfilment orders for own lots" on public.consumer_orders for select using (
  exists (
    select 1 from public.order_items item
    join public.produce_lots lot on lot.id = item.lot_id
    where item.order_id = consumer_orders.id and lot.farmer_id = auth.uid()
  )
);

drop policy if exists "farmers read order items for own lots" on public.order_items;
create policy "farmers read order items for own lots" on public.order_items for select using (
  exists (select 1 from public.produce_lots lot where lot.id = order_items.lot_id and lot.farmer_id = auth.uid())
);

drop policy if exists "farmers read linked logistics jobs" on public.logistics_jobs;
create policy "farmers read linked logistics jobs" on public.logistics_jobs for select using (
  requested_by = auth.uid()
  or exists (select 1 from public.farmer_listings listing where listing.id = logistics_jobs.source_id and listing.farmer_id = auth.uid())
  or exists (select 1 from public.produce_requests request where request.id = logistics_jobs.source_id and request.farmer_id = auth.uid())
);
