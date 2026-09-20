create table if not exists public.consumer_notifications (
  id uuid primary key default gen_random_uuid(),
  consumer_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid not null references public.consumer_orders(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.consumer_notifications enable row level security;
drop policy if exists "consumers read own notifications" on public.consumer_notifications;
drop policy if exists "consumers mark own notifications read" on public.consumer_notifications;
create policy "consumers read own notifications" on public.consumer_notifications for select using (consumer_id = auth.uid());
create policy "consumers mark own notifications read" on public.consumer_notifications for update using (consumer_id = auth.uid()) with check (consumer_id = auth.uid());

create or replace function public.notify_consumer_order_ready()
returns trigger language plpgsql security definer set search_path=public as $$
declare warehouse_label text;
begin
  if new.status = 'ready_for_pickup' and old.status is distinct from 'ready_for_pickup' then
    select name into warehouse_label from public.warehouses where id = new.pickup_warehouse_id;
    insert into public.consumer_notifications(consumer_id, order_id, title, body)
    values (new.consumer_id, new.id, 'Your order is packed and ready',
      format('Order %s has been packed and is ready for collection at %s.', new.order_code, coalesce(warehouse_label, 'your selected warehouse')));
  end if;
  return new;
end; $$;

drop trigger if exists consumer_order_ready_notification on public.consumer_orders;
create trigger consumer_order_ready_notification after update of status on public.consumer_orders
  for each row execute procedure public.notify_consumer_order_ready();

create or replace function public.confirm_consumer_order_collection(p_order_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare current_order public.consumer_orders%rowtype;
begin
  select * into current_order from public.consumer_orders where id = p_order_id for update;
  if current_order.id is null or current_order.consumer_id <> auth.uid() then raise exception 'You can confirm only your own order collection'; end if;
  if current_order.status <> 'ready_for_pickup' then raise exception 'This order is not ready for collection yet'; end if;
  update public.consumer_orders set status = 'completed' where id = p_order_id;
end; $$;

grant execute on function public.confirm_consumer_order_collection(uuid) to authenticated;

do $$ begin
  if not exists (select 1 from pg_publication_rel r join pg_publication p on p.oid=r.prpubid where p.pubname='supabase_realtime' and r.prrelid='public.consumer_notifications'::regclass) then
    alter publication supabase_realtime add table public.consumer_notifications;
  end if;
end $$;
