-- Create the encounter-recordings bucket
insert into storage.buckets (id, name, public)
values ('encounter-recordings', 'encounter-recordings', true)
on conflict (id) do nothing;

-- Set up security policies for the bucket

-- Allow public read access (for playing recordings)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'encounter-recordings' );

-- Allow authenticated users to upload files
create policy "Authenticated Insert"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'encounter-recordings' );

-- Allow authenticated users to update their files
create policy "Authenticated Update"
on storage.objects for update
to authenticated
using ( bucket_id = 'encounter-recordings' );

-- Allow authenticated users to delete their files
create policy "Authenticated Delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'encounter-recordings' );
