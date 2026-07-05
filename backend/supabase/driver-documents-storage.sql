-- Run in Supabase SQL Editor to enable driver document uploads.
-- Creates a public bucket for registration documents uploaded during /driver/register.

insert into storage.buckets (id, name, public)
values ('driver-documents', 'driver-documents', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload driver documents"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'driver-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated users can update own driver documents"
on storage.objects for update
to authenticated
using (
  bucket_id = 'driver-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'driver-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated users can delete own driver documents"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'driver-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Public read for driver documents"
on storage.objects for select
to public
using (bucket_id = 'driver-documents');
