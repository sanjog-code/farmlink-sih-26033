-- Remove only the original, named demo inventory. Warehouse and cluster locations remain.
delete from public.order_items
where lot_id in (
  select id from public.produce_lots
  where lot_code in ('FL-24091', 'FL-24092', 'FL-24093')
);

delete from public.produce_lots
where lot_code in ('FL-24091', 'FL-24092', 'FL-24093');
