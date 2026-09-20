-- Keep operations dashboards current as orders and collection requests are created.
do $$
begin
  if not exists (select 1 from pg_publication_rel relation join pg_publication publication on publication.oid=relation.prpubid where publication.pubname='supabase_realtime' and relation.prrelid='public.consumer_orders'::regclass) then
    alter publication supabase_realtime add table public.consumer_orders;
  end if;
  if not exists (select 1 from pg_publication_rel relation join pg_publication publication on publication.oid=relation.prpubid where publication.pubname='supabase_realtime' and relation.prrelid='public.produce_requests'::regclass) then
    alter publication supabase_realtime add table public.produce_requests;
  end if;
  if not exists (select 1 from pg_publication_rel relation join pg_publication publication on publication.oid=relation.prpubid where publication.pubname='supabase_realtime' and relation.prrelid='public.logistics_jobs'::regclass) then
    alter publication supabase_realtime add table public.logistics_jobs;
  end if;
  if not exists (select 1 from pg_publication_rel relation join pg_publication publication on publication.oid=relation.prpubid where publication.pubname='supabase_realtime' and relation.prrelid='public.bulk_requests'::regclass) then
    alter publication supabase_realtime add table public.bulk_requests;
  end if;
end $$;
