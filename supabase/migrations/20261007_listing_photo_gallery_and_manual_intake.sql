-- Preserve every farmer-submitted image while retaining image_url for older
-- clients and existing listings.
alter table public.farmer_listings
  add column if not exists image_urls text[] not null default '{}';

update public.farmer_listings
set image_urls = array[image_url]
where coalesce(array_length(image_urls, 1), 0) = 0
  and image_url is not null;
