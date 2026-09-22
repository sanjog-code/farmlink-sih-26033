-- Keep the worker credential in Vault; only the database cron and service role can read/check it.
create or replace function public.validate_platform_scheduler_token(p_token text)
returns boolean language plpgsql security definer set search_path=public as $$
declare valid boolean := false;
begin
  if p_token is null or length(p_token)<32 or to_regclass('vault.decrypted_secrets') is null then return false; end if;
  execute 'select exists(select 1 from vault.decrypted_secrets where name=$1 and decrypted_secret=$2)'
    into valid using 'farmlink_platform_scheduler_token',p_token;
  return valid;
end $$;
revoke all on function public.validate_platform_scheduler_token(text) from public,anon,authenticated;
grant execute on function public.validate_platform_scheduler_token(text) to service_role;

do $$ begin
  if to_regclass('vault.decrypted_secrets') is not null and exists(select 1 from pg_extension where extname='pg_cron') and exists(select 1 from pg_extension where extname='pg_net') then
    if not exists(select 1 from vault.decrypted_secrets where name='farmlink_platform_scheduler_token') then
      perform vault.create_secret(replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-',''),'farmlink_platform_scheduler_token','FarmLink notification and partner outbox scheduler');
    end if;
    if not exists(select 1 from cron.job where jobname='farmlink-platform-integrations') then
      perform cron.schedule('farmlink-platform-integrations','*/5 * * * *',$job$
        select net.http_post(
          url := 'https://neoyrdfpvnfsnxwjbthm.supabase.co/functions/v1/platform-integrations',
          headers := jsonb_build_object('Content-Type','application/json','x-platform-scheduler',
            (select decrypted_secret from vault.decrypted_secrets where name='farmlink_platform_scheduler_token' limit 1)),
          body := '{"action":"process"}'::jsonb,
          timeout_milliseconds := 10000
        );
      $job$);
    end if;
  end if;
end $$;
