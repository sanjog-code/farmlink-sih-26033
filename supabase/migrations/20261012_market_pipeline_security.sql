-- Daily mandi observations and seasonal MSP are separate, auditable datasets.
alter table public.market_price_snapshots add column if not exists grade text not null default '';
update public.market_price_snapshots set district=coalesce(district,''), state=coalesce(state,''), variety=coalesce(variety,'');
alter table public.market_price_snapshots alter column district set default '', alter column district set not null,
  alter column state set default '', alter column state set not null,
  alter column variety set default '', alter column variety set not null;
-- The original constraint collapsed varieties and districts. Replace only it.
do $$ declare item record; begin
  for item in select conname from pg_constraint where conrelid='public.market_price_snapshots'::regclass and contype='u'
  loop execute format('alter table public.market_price_snapshots drop constraint %I',item.conname); end loop;
end $$;
create unique index if not exists market_snapshot_series_date_key on public.market_price_snapshots(crop,market,state,district,variety,grade,price_date);
create index if not exists market_snapshot_series_history_idx on public.market_price_snapshots(crop,market,state,district,variety,grade,price_date desc);
alter table public.market_sync_runs add column if not exists next_offset integer not null default 0,
  add column if not exists total_expected integer,
  add column if not exists records_rejected integer not null default 0,
  add column if not exists heartbeat_at timestamptz not null default now();

-- An unguessable, short-lived, one-use ticket authorizes each scheduler request.
-- No service key, API key, or reusable scheduler credential is stored in cron.
create table if not exists public.market_refresh_tickets (
  token uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now()+interval '5 minutes'
);
alter table public.market_refresh_tickets enable row level security;
revoke all on public.market_refresh_tickets from public,anon,authenticated;

create or replace function public.request_market_refresh()
returns bigint language plpgsql security definer set search_path=public,pg_temp as $$
declare ticket uuid; request_id bigint;
begin
  if session_user not in ('postgres','supabase_admin') and coalesce(auth.role(),'')<>'service_role' and not coalesce(public.is_admin(),false) then
    raise exception 'Administrator access required' using errcode='42501';
  end if;
  perform pg_advisory_xact_lock(hashtext('farmlink_market_refresh'));
  delete from public.market_refresh_tickets where expires_at<now();
  if exists(select 1 from public.market_refresh_tickets where expires_at>now()) or
     exists(select 1 from public.market_sync_runs where status='running' and heartbeat_at>now()-interval '5 minutes') then return null; end if;
  -- Manual refreshes cannot create an unbounded upstream request stream.
  if exists(select 1 from public.market_sync_runs where status in ('succeeded','failed') and completed_at>now()-interval '5 minutes') then return null; end if;
  insert into public.market_refresh_tickets default values returning token into ticket;
  select net.http_post(
    url:='https://neoyrdfpvnfsnxwjbthm.supabase.co/functions/v1/refresh-market-data',
    headers:='{"Content-Type":"application/json"}'::jsonb,
    body:=jsonb_build_object('ticket',ticket),timeout_milliseconds:=10000
  ) into request_id;
  return request_id;
end $$;
revoke all on function public.request_market_refresh() from public,anon;
grant execute on function public.request_market_refresh() to authenticated,service_role;

create or replace function public.claim_market_refresh(p_ticket uuid)
returns public.market_sync_runs language plpgsql security definer set search_path=public,pg_temp as $$
declare claimed uuid; result public.market_sync_runs;
begin
  perform pg_advisory_xact_lock(hashtext('farmlink_market_refresh'));
  delete from public.market_refresh_tickets where token=p_ticket and expires_at>now() returning token into claimed;
  if claimed is null then raise exception 'Invalid or expired refresh ticket' using errcode='42501'; end if;
  if exists(select 1 from public.market_sync_runs where status='running' and heartbeat_at>now()-interval '5 minutes') then
    raise exception 'A market refresh is already running';
  end if;
  update public.market_sync_runs set status='failed',completed_at=now(),details='Worker stopped before completion; the next import will retry.' where status='running';
  select * into result from public.market_sync_runs where status='partial' and started_at>now()-interval '1 day'
    and next_offset>0 order by started_at desc limit 1 for update;
  if result.id is not null then
    update public.market_sync_runs set status='running',heartbeat_at=now(),completed_at=null where id=result.id returning * into result;
  else
    insert into public.market_sync_runs(source_name,status) values ('data.gov.in / AGMARKNET','running') returning * into result;
  end if;
  return result;
end $$;
revoke all on function public.claim_market_refresh(uuid) from public,anon,authenticated;
grant execute on function public.claim_market_refresh(uuid) to service_role;

create or replace function public.continue_market_refresh()
returns bigint language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if exists(select 1 from public.market_sync_runs where status='partial' and next_offset>0 and started_at>now()-interval '1 day') then
    return public.request_market_refresh();
  end if;
  return null;
end $$;
revoke all on function public.continue_market_refresh() from public,anon,authenticated;
grant execute on function public.continue_market_refresh() to service_role;

create table if not exists public.msp_notification_checks (
  source_url text primary key, checked_at timestamptz not null default now(),
  reachable boolean not null default false, http_status integer,
  content_hash text, previous_hash text, changed_at timestamptz,
  note text not null default 'Source availability does not verify the MSP amount or season.'
);
alter table public.msp_notification_checks enable row level security;
create policy "users read MSP source checks" on public.msp_notification_checks for select to authenticated using(true);

create table if not exists public.msp_rate_proposals (
  id uuid primary key default gen_random_uuid(), crop text not null,
  msp_per_quintal numeric not null check(msp_per_quintal>0 and msp_per_quintal<10000000),
  marketing_season text not null, effective_from date not null, source_url text not null,
  verification_note text not null check(length(verification_note)>=20),
  status text not null default 'pending' check(status in ('pending','approved','rejected')),
  submitted_by uuid references auth.users(id), submitted_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
  previous_rate jsonb, published_source_hash text
);
alter table public.msp_rate_proposals enable row level security;
create policy "admins read MSP proposals" on public.msp_rate_proposals for select to authenticated using(public.is_admin());

create or replace function public.submit_msp_rate(p_crop text,p_msp_per_quintal numeric,p_marketing_season text,p_effective_from date,p_source_url text,p_verification_note text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare result uuid;
begin
  if not coalesce(public.is_admin(),false) then raise exception 'Administrator access required' using errcode='42501'; end if;
  if length(trim(p_crop)) not between 1 and 100 or length(trim(p_marketing_season)) not between 4 and 60 or length(trim(p_verification_note))<20 then raise exception 'Crop, season and a verification note are required'; end if;
  if p_source_url !~ '^https://(www\.)?(pib\.gov\.in|cacp\.da\.gov\.in|agricoop\.gov\.in|desagri\.gov\.in)/' and p_source_url !~ '^https://static\.pib\.gov\.in/' then raise exception 'Use an official Government MSP notification URL'; end if;
  insert into public.msp_rate_proposals(crop,msp_per_quintal,marketing_season,effective_from,source_url,verification_note,submitted_by)
  values(trim(p_crop),p_msp_per_quintal,trim(p_marketing_season),p_effective_from,p_source_url,trim(p_verification_note),auth.uid()) returning id into result;
  return result;
end $$;
revoke all on function public.submit_msp_rate(text,numeric,text,date,text,text) from public,anon;
grant execute on function public.submit_msp_rate(text,numeric,text,date,text,text) to authenticated;

create or replace function public.review_msp_rate(p_proposal_id uuid,p_approve boolean)
returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare proposal public.msp_rate_proposals; source_check public.msp_notification_checks; old_rate jsonb;
begin
  if not coalesce(public.is_admin(),false) then raise exception 'Administrator access required' using errcode='42501'; end if;
  select * into proposal from public.msp_rate_proposals where id=p_proposal_id for update;
  if proposal.id is null or proposal.status<>'pending' then raise exception 'This proposal is no longer pending'; end if;
  if p_approve then
    if proposal.effective_from>(now() at time zone 'Asia/Kolkata')::date then raise exception 'The notification is not effective yet'; end if;
    select * into source_check from public.msp_notification_checks where source_url=proposal.source_url;
    if not coalesce(source_check.reachable,false) or source_check.content_hash is null or source_check.checked_at<now()-interval '7 days' then raise exception 'Refresh official sources before approving this notification'; end if;
    select to_jsonb(r) into old_rate from public.msp_rates r where crop=proposal.crop;
    insert into public.msp_rates(crop,msp_per_kg,marketing_season,source_url)
    values(proposal.crop,proposal.msp_per_quintal/100,proposal.marketing_season,proposal.source_url)
    on conflict(crop) do update set msp_per_kg=excluded.msp_per_kg,marketing_season=excluded.marketing_season,source_url=excluded.source_url,updated_at=now();
  end if;
  update public.msp_rate_proposals set status=case when p_approve then 'approved' else 'rejected' end,
    reviewed_at=now(),reviewed_by=auth.uid(),previous_rate=old_rate,published_source_hash=source_check.content_hash where id=p_proposal_id;
  return case when p_approve then 'approved' else 'rejected' end;
end $$;
revoke all on function public.review_msp_rate(uuid,boolean) from public,anon;
grant execute on function public.review_msp_rate(uuid,boolean) to authenticated;

create or replace function public.get_market_series(p_crop text)
returns table(market text,state text,district text,variety text,grade text,latest_date date,observations bigint)
language sql stable security invoker set search_path=public,pg_temp as $$
  select s.market,s.state,s.district,s.variety,s.grade,max(s.price_date),count(*)
  from public.market_price_snapshots s where s.crop=p_crop
  group by s.market,s.state,s.district,s.variety,s.grade order by max(s.price_date) desc,s.market limit 2000;
$$;
revoke all on function public.get_market_series(text) from public,anon;
grant execute on function public.get_market_series(text) to authenticated;

create or replace function public.market_sales_summary(p_crop text)
returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select case when auth.uid() is null then null else
    jsonb_build_object('count',count(*),'averagePrice',case when count(*)>=3 then round(avg(q.offered_price_per_kg),2) else null end,
    'label','Confirmed bulk agreements in the last 90 days; not settlement or payment records') end
  from public.bulk_quotes q join public.bulk_requests r on r.id=q.request_id
  where r.crop=p_crop and q.status='accepted' and r.status='confirmed' and q.created_at>now()-interval '90 days';
$$;
revoke all on function public.market_sales_summary(text) from public,anon;
grant execute on function public.market_sales_summary(text) to authenticated;

do $$ declare table_name text; begin
  foreach table_name in array array['market_sync_runs','msp_rates','msp_notification_checks','msp_rate_proposals'] loop
    if not exists(select 1 from pg_publication_rel r join pg_publication p on p.oid=r.prpubid where p.pubname='supabase_realtime' and r.prrelid=format('public.%I',table_name)::regclass) then
      execute format('alter publication supabase_realtime add table public.%I',table_name);
    end if;
  end loop;
end $$;

-- Replace the old publicly callable scheduler; continuation safely handles
-- datasets larger than one Edge Function execution window.
select cron.unschedule(jobid) from cron.job where jobname in ('farmlink-daily-market-refresh','farmlink-market-refresh-continuation');
select cron.schedule('farmlink-daily-market-refresh','30 12 * * *','select public.request_market_refresh()');
select cron.schedule('farmlink-market-refresh-continuation','*/5 * * * *','select public.continue_market_refresh()');
