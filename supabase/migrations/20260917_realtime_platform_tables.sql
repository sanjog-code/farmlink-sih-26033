-- Publish the remaining shared operational records for dashboard refreshes.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['produce_lots','warehouses'] loop
    if not exists (
      select 1 from pg_publication_rel relation
      join pg_publication publication on publication.oid=relation.prpubid
      where publication.pubname='supabase_realtime'
        and relation.prrelid=('public.'||table_name)::regclass
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;
