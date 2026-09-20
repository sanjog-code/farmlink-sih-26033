-- MSP is notified seasonally for selected crops only.  A crop without a
-- currently notified MSP must remain listable and quotable on FarmLink.
-- Reference prices may still be displayed by the admin, but are not a hard
-- marketplace barrier.
create or replace function public.get_crop_price_floor(p_crop text)
returns numeric language plpgsql stable security definer set search_path=public as $$
declare official_msp numeric;
begin
  select msp_per_kg into official_msp
  from public.msp_rates
  where crop = p_crop;

  return coalesce(official_msp, 0);
end; $$;

-- Keep a transparent record of the official source behind the displayed MSP.
-- It is deliberately not described as a daily MSP feed: MSP announcements are
-- seasonal Government notifications, unlike daily mandi market prices.
create table if not exists public.msp_source_status (
  id boolean primary key default true check (id),
  source_name text not null,
  source_url text not null,
  update_frequency text not null,
  last_checked_at timestamptz not null default now(),
  note text
);

alter table public.msp_source_status enable row level security;
drop policy if exists "authenticated users read MSP source status" on public.msp_source_status;
create policy "authenticated users read MSP source status"
  on public.msp_source_status for select using (auth.uid() is not null);

insert into public.msp_source_status(id, source_name, source_url, update_frequency, last_checked_at, note)
values (
  true,
  'Government of India — Press Information Bureau / CACP notifications',
  'https://www.pib.gov.in/',
  'Seasonal official notification; source checked daily',
  now(),
  'MSP applies only where the Government has issued a current crop and season notification. Daily mandi prices are separate market data.'
)
on conflict (id) do update set
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  update_frequency = excluded.update_frequency,
  last_checked_at = excluded.last_checked_at,
  note = excluded.note;

-- Current 2026-27 notified rates, in INR/kg, from the relevant PIB releases.
insert into public.msp_rates(crop,msp_per_kg,marketing_season,source_url) values
  ('Rice',24.41,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Paddy (Common)',24.41,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Maize',24.10,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Pearl millet (Bajra)',29.00,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Finger millet (Ragi)',52.05,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Sorghum (Jowar)',40.23,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Pigeon pea (Arhar/Tur)',84.50,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Green gram (Moong)',87.80,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Black gram (Urad)',82.00,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Groundnut',75.17,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Soybean',57.08,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Sunflower',83.43,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Sesame',103.46,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Sesame (Til)',103.46,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3'),
  ('Cotton',82.67,'KMS 2026-27','https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=1&reg=3')
on conflict (crop) do update set
  msp_per_kg = excluded.msp_per_kg,
  marketing_season = excluded.marketing_season,
  source_url = excluded.source_url,
  updated_at = now();
