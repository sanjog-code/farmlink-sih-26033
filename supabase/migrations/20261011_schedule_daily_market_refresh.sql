-- Invoke the public-government data importer daily at 18:00 IST (12:30 UTC).
-- The importer carries no customer data and uses only the server-side
-- DATA_GOV_IN_API_KEY secret for the official source request.
do $$
declare cron_job_exists boolean := false;
begin
  begin execute 'create extension if not exists pg_net'; exception when insufficient_privilege then null; end;
  begin execute 'create extension if not exists pg_cron'; exception when insufficient_privilege then null; end;
  if exists (select 1 from pg_extension where extname = 'pg_cron') and exists (select 1 from pg_extension where extname = 'pg_net') then
    execute $cron$select exists (select 1 from cron.job where jobname = 'farmlink-daily-market-refresh')$cron$ into cron_job_exists;
    if not cron_job_exists then
      execute $cron$select cron.schedule('farmlink-daily-market-refresh', '30 12 * * *', $job$select net.http_post(url := 'https://neoyrdfpvnfsnxwjbthm.supabase.co/functions/v1/refresh-market-data', headers := '{"Content-Type":"application/json"}'::jsonb, body := '{}'::jsonb)$job$)$cron$;
    end if;
  end if;
end $$;
