-- Public bucket for DJ images (profile + showcase). Paths: {auth.uid()}/...

insert into storage.buckets (id, name, public)
values ('dj-media', 'dj-media', true)
on conflict (id) do update set public = excluded.public;

create policy "Public read dj media"
  on storage.objects for select
  using (bucket_id = 'dj-media');

create policy "Authenticated users upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'dj-media'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Authenticated users update own objects"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'dj-media'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Authenticated users delete own objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'dj-media'
    and split_part(name, '/', 1) = auth.uid()::text
  );
