create table if not exists public.ai_usage_windows (
  user_id uuid not null references auth.users(id) on delete cascade,
  service text not null check (service in ('voice','grading')),
  window_start timestamptz not null,
  requests integer not null default 0,
  primary key (user_id, service, window_start)
);
alter table public.ai_usage_windows enable row level security;
revoke all on public.ai_usage_windows from anon, authenticated;

create or replace function public.consume_ai_quota(p_user_id uuid, p_service text)
returns boolean language plpgsql security definer set search_path = public as $$
declare counter integer; current_window timestamptz := date_trunc('hour', now());
begin
  if p_service not in ('voice','grading') or p_user_id is null then return false; end if;
  insert into public.ai_usage_windows(user_id, service, window_start, requests)
    values (p_user_id, p_service, current_window, 1)
  on conflict (user_id, service, window_start) do update
    set requests = public.ai_usage_windows.requests + 1
    where public.ai_usage_windows.requests < 30
  returning requests into counter;
  return counter is not null;
end;
$$;
revoke all on function public.consume_ai_quota(uuid,text) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(uuid,text) to service_role;

create table if not exists public.ai_grading_reports (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  listing_id uuid references public.farmer_listings(id) on delete set null,
  crop text not null,
  photo_sha256 text not null,
  suggested_grade text check (suggested_grade in ('A','B','C')),
  observations jsonb not null default '[]'::jsonb,
  limitations jsonb not null default '[]'::jsonb,
  model_version text not null,
  requires_human_review boolean not null default true check (requires_human_review),
  created_at timestamptz not null default now()
);
alter table public.ai_grading_reports enable row level security;
grant select on public.ai_grading_reports to authenticated;
create policy "Read own grading or admin reports" on public.ai_grading_reports for select to authenticated
  using (created_by = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
revoke insert, update, delete on public.ai_grading_reports from anon, authenticated;
