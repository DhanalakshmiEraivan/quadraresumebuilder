-- QuadraResume hardening: persistent preferences, payment QR defaults and resume asset metadata.
alter table public.profiles
  add column if not exists preferences jsonb not null default '{"notifications":{"product":true,"weekly":true,"marketing":false},"privacy":{"analytics":true,"aiTraining":false,"publicSharing":false}}'::jsonb;

alter table public.resumes add column if not exists photo_path text;
alter table public.resumes add column if not exists template_version text default '2';

insert into public.app_settings(key,value)
values ('payment','{"upi_id":"dhalak65@okicici","merchant_name":"QuadraFroyn Solutions","unlimited_price":199,"business_price":0}'::jsonb)
on conflict(key) do nothing;

update public.app_settings
set value = jsonb_set(value,'{upi_id}',to_jsonb('dhalak65@okicici'::text),true)
where key='payment' and coalesce(value->>'upi_id','')='';

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('resume-assets','resume-assets',false,5242880,array['image/jpeg','image/png','image/webp']::text[])
on conflict(id) do update set file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types,public=false;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('payment-proofs','payment-proofs',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf']::text[])
on conflict(id) do update set file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types,public=false;

create or replace function public.set_resumes_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;

drop trigger if exists trg_resumes_updated_at on public.resumes;
create trigger trg_resumes_updated_at before update on public.resumes for each row execute function public.set_resumes_updated_at();

alter table public.resumes replica identity full;

create index if not exists idx_resumes_photo_path on public.resumes(photo_path);

drop policy if exists "resume assets select own folder" on storage.objects;
create policy "resume assets select own folder" on storage.objects
for select to authenticated
using (bucket_id = 'resume-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "resume assets insert own folder" on storage.objects;
create policy "resume assets insert own folder" on storage.objects
for insert to authenticated
with check (bucket_id = 'resume-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "resume assets update own folder" on storage.objects;
create policy "resume assets update own folder" on storage.objects
for update to authenticated
using (bucket_id = 'resume-assets' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'resume-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "resume assets delete own folder" on storage.objects;
create policy "resume assets delete own folder" on storage.objects
for delete to authenticated
using (bucket_id = 'resume-assets' and (storage.foldername(name))[1] = auth.uid()::text);
