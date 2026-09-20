-- Remove administrator-created inventory from every operational marketplace view
-- while retaining records for audit and avoiding destructive changes to orders.
update public.farmer_listings
set status = 'removed'
where farmer_id in (select id from public.profiles where role = 'admin')
  and status in ('pending', 'scheduled', 'published');

update public.produce_lots
set marketplace_visible = false
where (farmer_id in (select id from public.profiles where role = 'admin') or farmer_id is null)
  and marketplace_visible is distinct from false;
