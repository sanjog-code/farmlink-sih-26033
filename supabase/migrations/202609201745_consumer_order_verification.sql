-- New consumer orders are cancellable for ten minutes while awaiting verification.
alter table public.consumer_orders
  add column if not exists cancellation_expires_at timestamptz;

create index if not exists consumer_orders_pending_verification_expiry_idx
  on public.consumer_orders (cancellation_expires_at)
  where status = 'pending_verification';

create or replace function public.confirm_expired_consumer_orders()
returns void language sql security definer set search_path = public as $$
  update public.consumer_orders
  set status = 'confirmed'
  where status = 'pending_verification'
    and cancellation_expires_at <= now();
$$;

revoke all on function public.confirm_expired_consumer_orders() from public;
grant execute on function public.confirm_expired_consumer_orders() to authenticated;

drop policy if exists "consumers cancel pending orders" on public.consumer_orders;
create policy "consumers cancel pending orders" on public.consumer_orders
  for update
  using (consumer_id = auth.uid() and status = 'pending_verification' and cancellation_expires_at > now())
  with check (consumer_id = auth.uid() and status = 'cancelled');


drop policy if exists "consumers confirm expired orders" on public.consumer_orders;
create policy "consumers confirm expired orders" on public.consumer_orders
  for update
  using (consumer_id = auth.uid() and status = 'pending_verification' and cancellation_expires_at <= now())
  with check (consumer_id = auth.uid() and status = 'confirmed');
