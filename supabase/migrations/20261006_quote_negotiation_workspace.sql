-- Each counter-offer carries its context, giving both parties an auditable
-- negotiation thread instead of a single anonymous price field.
alter table public.bulk_quotes
  add column if not exists note text check (char_length(note) <= 500);

create or replace function public.mark_bulk_request_in_negotiation()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  update public.bulk_requests
  set status = 'negotiation'
  where id = new.request_id
    and status not in ('confirmed', 'declined');
  return new;
end; $$;

drop trigger if exists bulk_quote_sets_negotiation_status on public.bulk_quotes;
create trigger bulk_quote_sets_negotiation_status
  after insert on public.bulk_quotes
  for each row execute procedure public.mark_bulk_request_in_negotiation();
