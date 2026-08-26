-- QuadraResume contact center
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  subject text not null default 'General enquiry',
  message text not null,
  status text not null default 'new' check (status in ('new','read','replied','closed')),
  admin_reply text,
  replied_at timestamptz,
  replied_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_created_at on public.contact_messages(created_at desc);
create index if not exists idx_contact_messages_user_id on public.contact_messages(user_id);

alter table public.contact_messages enable row level security;

drop policy if exists "contact insert public" on public.contact_messages;
create policy "contact insert public" on public.contact_messages
for insert to anon, authenticated
with check (
  (user_id is null or user_id = auth.uid())
  and length(trim(name)) between 2 and 120
  and length(trim(email)) between 5 and 320
  and length(trim(subject)) between 2 and 180
  and length(trim(message)) between 5 and 5000
);

drop policy if exists "contact select own" on public.contact_messages;
create policy "contact select own" on public.contact_messages
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "contact update own read" on public.contact_messages;
create policy "contact update own read" on public.contact_messages
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "contact admin select" on public.contact_messages;
create policy "contact admin select" on public.contact_messages
for select to authenticated
using (public.is_admin());

drop policy if exists "contact admin update" on public.contact_messages;
create policy "contact admin update" on public.contact_messages
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.set_contact_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_contact_updated_at on public.contact_messages;
create trigger trg_contact_updated_at
before update on public.contact_messages
for each row execute function public.set_contact_updated_at();

alter table public.contact_messages replica identity full;

-- Enable live admin inbox updates when the Supabase realtime publication is available.
do $$
begin
  begin
    alter publication supabase_realtime add table public.contact_messages;
  exception when duplicate_object then null;
  end;
end $$;
