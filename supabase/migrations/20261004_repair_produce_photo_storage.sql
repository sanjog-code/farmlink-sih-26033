-- Make the farmer/warehouse photo pipeline self-contained on every deployed
-- database. The bucket is public because marketplace listings use public image
-- URLs; uploads remain restricted to the signed-in owner's folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'produce-photos',
  'produce-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "authenticated users upload produce photos" on storage.objects;
drop policy if exists "public reads produce photos" on storage.objects;
drop policy if exists "farmers manage own produce photos" on storage.objects;
drop policy if exists "farmers delete own produce photos" on storage.objects;

create policy "authenticated users upload produce photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'produce-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "public reads produce photos"
  on storage.objects for select
  using (bucket_id = 'produce-photos');

create policy "owners update produce photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'produce-photos' and owner_id = auth.uid()::text)
  with check (bucket_id = 'produce-photos' and owner_id = auth.uid()::text);

create policy "owners delete produce photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'produce-photos' and owner_id = auth.uid()::text);
