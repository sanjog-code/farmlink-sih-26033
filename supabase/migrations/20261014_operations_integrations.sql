-- Additive integration workflows. Existing checkout/intake state machines are unchanged.
create table if not exists public.warehouse_service_registry (
  warehouse_id uuid primary key references public.warehouses(id) on delete cascade,
  registration_reference text not null,
  repository_name text not null,
  verified_by uuid not null references public.profiles(id),
  verified_at timestamptz not null default now(),
  active boolean not null default true
);

create table if not exists public.farmer_service_applications (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id),
  lot_id uuid not null references public.produce_lots(id),
  service_type text not null check (service_type in ('warehouse_receipt','finance_enquiry')),
  requested_amount numeric check (requested_amount > 0 and requested_amount <= 100000000),
  farmer_note text not null default '' check (char_length(farmer_note) <= 2000),
  consent_version text not null default '2026-09-v1',
  consented_at timestamptz not null default now(),
  status text not null default 'submitted' check (status in ('submitted','under_review','needs_information','referred','rejected','withdrawn')),
  review_note text not null default '',
  provider_reference text,
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((service_type = 'finance_enquiry' and requested_amount is not null) or service_type = 'warehouse_receipt')
);
create unique index if not exists farmer_service_active_application on public.farmer_service_applications(lot_id, service_type)
  where status in ('submitted','under_review','needs_information','referred');

create table if not exists public.storage_inspections (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.produce_lots(id),
  inspector_id uuid not null references public.profiles(id),
  temperature_c numeric check (temperature_c between -50 and 70),
  humidity_percent numeric check (humidity_percent between 0 and 100),
  condition text not null check (condition in ('good','review_required','quarantine')),
  notes text not null default '' check (char_length(notes) <= 2000),
  inspected_at timestamptz not null default now()
);

create table if not exists public.integration_outbox (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email','ondc')),
  event_key text not null unique,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','processing','sent','failed','uncertain')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  claimed_at timestamptz,
  provider_reference text,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index if not exists integration_outbox_pending on public.integration_outbox(channel,next_attempt_at) where status in ('pending','failed','processing');

alter table public.warehouse_service_registry enable row level security;
alter table public.farmer_service_applications enable row level security;
alter table public.storage_inspections enable row level security;
alter table public.integration_outbox enable row level security;
create policy "authenticated read warehouse registry" on public.warehouse_service_registry for select to authenticated using (true);
create policy "admins manage warehouse registry" on public.warehouse_service_registry for all to authenticated using (public.is_admin()) with check (public.is_admin() and verified_by = auth.uid());
create policy "participants read service applications" on public.farmer_service_applications for select to authenticated using (farmer_id = auth.uid() or public.is_admin());
create policy "participants read storage inspections" on public.storage_inspections for select to authenticated using (public.is_admin() or exists(select 1 from public.produce_lots l where l.id=lot_id and l.farmer_id=auth.uid()));
create policy "admins record storage inspections" on public.storage_inspections for insert to authenticated with check (public.is_admin() and inspector_id=auth.uid());
create policy "admins read integration outbox" on public.integration_outbox for select to authenticated using (public.is_admin());

create or replace function public.submit_farmer_service_application(p_lot_id uuid, p_service_type text, p_requested_amount numeric default null, p_note text default '', p_consent boolean default false)
returns uuid language plpgsql security definer set search_path=public as $$
declare result uuid;
begin
  if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='farmer') then raise exception 'A farmer account is required'; end if;
  if not p_consent then raise exception 'Consent is required'; end if;
  if not exists(select 1 from public.produce_lots where id=p_lot_id and farmer_id=auth.uid() and quantity_kg > 0) then raise exception 'Choose your own available warehouse lot'; end if;
  if p_service_type not in ('warehouse_receipt','finance_enquiry') then raise exception 'Invalid service'; end if;
  if p_service_type='finance_enquiry' and (p_requested_amount is null or p_requested_amount <= 0 or p_requested_amount > 100000000) then raise exception 'Enter a valid requested amount'; end if;
  insert into public.farmer_service_applications(farmer_id,lot_id,service_type,requested_amount,farmer_note)
    values(auth.uid(),p_lot_id,p_service_type,p_requested_amount,trim(coalesce(p_note,''))) returning id into result;
  return result;
end $$;

create or replace function public.review_farmer_service_application(p_id uuid, p_status text, p_note text default '', p_provider_reference text default null)
returns void language plpgsql security definer set search_path=public as $$
declare application public.farmer_service_applications%rowtype;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select * into application from public.farmer_service_applications where id=p_id for update;
  if not found then raise exception 'Application not found'; end if;
  if application.status in ('referred','rejected','withdrawn') then raise exception 'This application is already closed'; end if;
  if p_status='withdrawn' then
    if application.farmer_id <> auth.uid() then raise exception 'Only the applicant can withdraw consent'; end if;
  else
    if not public.is_admin() then raise exception 'Administrator access required'; end if;
    if p_status not in ('under_review','needs_information','referred','rejected') then raise exception 'Invalid review status'; end if;
    if p_status in ('needs_information','rejected') and nullif(trim(p_note),'') is null then raise exception 'A review reason is required'; end if;
    if p_status='referred' then
      if nullif(trim(p_provider_reference),'') is null then raise exception 'Enter the external provider acknowledgement reference'; end if;
      if application.service_type='warehouse_receipt' and not exists(
        select 1 from public.produce_lots l join public.warehouse_service_registry r on r.warehouse_id=l.warehouse_id
        where l.id=application.lot_id and r.active
      ) then raise exception 'Verify the registered warehouse and repository before referring an e-NWR enquiry'; end if;
    end if;
  end if;
  update public.farmer_service_applications set status=p_status,review_note=left(coalesce(p_note,''),2000),
    provider_reference=nullif(trim(p_provider_reference),''),reviewed_by=auth.uid(),updated_at=now() where id=p_id;
end $$;

-- Enqueue a copy of the existing in-app ready notification; no historical emails are backfilled.
create or replace function public.enqueue_consumer_notification_email()
returns trigger language plpgsql security definer set search_path=public as $$
declare recipient text;
begin
  select email into recipient from public.profiles where id=new.consumer_id;
  if recipient ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and recipient !~* '\.(invalid|local)$' then
    insert into public.integration_outbox(channel,event_key,payload) values(
      'email','consumer-notification:'||new.id::text,
      jsonb_build_object('to',recipient,'subject',new.title,'text',new.body,'order_id',new.order_id)
    ) on conflict(event_key) do nothing;
  end if;
  return new;
end $$;
drop trigger if exists consumer_notification_email_outbox on public.consumer_notifications;
create trigger consumer_notification_email_outbox after insert on public.consumer_notifications for each row execute function public.enqueue_consumer_notification_email();

create or replace function public.queue_ondc_catalogue_export()
returns uuid language plpgsql security definer set search_path=public as $$
declare result uuid; catalogue jsonb;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  perform pg_advisory_xact_lock(hashtext('farmlink_ondc_export'));
  if exists(select 1 from public.integration_outbox where channel='ondc' and status in ('pending','processing','failed')) then raise exception 'A catalogue export is already queued'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',l.id,'crop',l.crop,'grade',l.grade,'available_kg',l.quantity_kg,'price_per_kg',l.price_per_kg,'warehouse_id',l.warehouse_id,'currency','INR','unit','kg')), '[]'::jsonb)
    into catalogue from public.produce_lots l join public.warehouses w on w.id=l.warehouse_id where l.quantity_kg>0 and w.active and l.marketplace_visible
      and exists(select 1 from public.farmer_listings f join public.profiles p on p.id=f.farmer_id where f.produce_lot_id=l.id and f.status='published' and p.role='farmer');
  insert into public.integration_outbox(channel,event_key,payload) values('ondc','catalogue:'||gen_random_uuid()::text,
    jsonb_build_object('schema','farmlink.partner.catalogue.v1','generated_at',now(),'items',catalogue)) returning id into result;
  return result;
end $$;

-- Only the edge worker's service role may claim or complete queue messages.
create or replace function public.claim_integration_outbox(p_channel text, p_limit integer default 10)
returns setof public.integration_outbox language plpgsql security definer set search_path=public as $$
begin
  -- Stop uncertain retries outside the provider's 24-hour idempotency window.
  update public.integration_outbox set status='uncertain',last_error='Delivery requires review: retry window exceeded'
    where channel=p_channel and status in ('failed','processing') and attempts>0 and created_at<now()-interval '23 hours';
  return query with claimed as (
    select id from public.integration_outbox where channel=p_channel and attempts<5 and created_at>now()-interval '7 days'
      and ((status in ('pending','failed') and next_attempt_at<=now()) or (status='processing' and claimed_at<now()-interval '10 minutes'))
    order by created_at for update skip locked limit least(greatest(p_limit,1),20)
  ) update public.integration_outbox o set status='processing',attempts=attempts+1,claimed_at=now()
    from claimed c where o.id=c.id returning o.*;
end $$;

revoke all on function public.submit_farmer_service_application(uuid,text,numeric,text,boolean) from public,anon;
revoke all on function public.review_farmer_service_application(uuid,text,text,text) from public,anon;
revoke all on function public.queue_ondc_catalogue_export() from public,anon;
grant execute on function public.submit_farmer_service_application(uuid,text,numeric,text,boolean) to authenticated;
grant execute on function public.review_farmer_service_application(uuid,text,text,text) to authenticated;
grant execute on function public.queue_ondc_catalogue_export() to authenticated;
revoke all on function public.claim_integration_outbox(text,integer) from public,anon,authenticated;
grant execute on function public.claim_integration_outbox(text,integer) to service_role;

do $$ declare table_name text; begin
  foreach table_name in array array['farmer_service_applications','storage_inspections','integration_outbox','warehouse_service_registry'] loop
    if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(
      select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=table_name
    ) then execute format('alter publication supabase_realtime add table public.%I',table_name); end if;
  end loop;
end $$;
