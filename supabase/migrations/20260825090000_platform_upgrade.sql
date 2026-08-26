
-- QuadraResume / QuadraFroyn production platform layer
create extension if not exists pgcrypto;

create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text default '',
 avatar_url text,
 phone text default '',
 location text default '',
 job_title text default '',
 role text not null default 'user' check(role in ('user','admin')),
 plan text not null default 'free' check(plan in ('free','unlimited','business')),
 monthly_ai_used integer not null default 0,
 monthly_tool_used integer not null default 0,
 credits_month text not null default to_char(date_trunc('month',now()),'YYYY-MM'),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 preferences jsonb not null default '{"notifications":{"product":true,"weekly":true,"marketing":false},"privacy":{"analytics":true,"aiTraining":false,"publicSharing":false}}'::jsonb
);

create table if not exists public.app_settings(
 key text primary key,
 value jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);

create table if not exists public.payment_submissions(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 plan text not null check(plan in ('unlimited','business')),
 transaction_id text not null,
 proof_path text not null,
 amount numeric(12,2) not null default 199,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 admin_note text default '',
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now()
);

create table if not exists public.credit_events(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 tool text not null,
 credits integer not null default 1,
 created_at timestamptz not null default now()
);

create table if not exists public.tool_usage(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 tool text not null,
 input_meta jsonb default '{}'::jsonb,
 created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists preferences jsonb not null default '{"notifications":{"product":true,"weekly":true,"marketing":false},"privacy":{"analytics":true,"aiTraining":false,"publicSharing":false}}'::jsonb;

alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.payment_submissions enable row level security;
alter table public.credit_events enable row level security;
alter table public.tool_usage enable row level security;

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=uid and role='admin') $$;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select using(auth.uid()=id or public.is_admin());
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update using(auth.uid()=id or public.is_admin()) with check(auth.uid()=id or public.is_admin());
drop policy if exists settings_read on public.app_settings;
create policy settings_read on public.app_settings for select to authenticated using(true);
drop policy if exists settings_admin_write on public.app_settings;
create policy settings_admin_write on public.app_settings for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists payment_self on public.payment_submissions;
create policy payment_self on public.payment_submissions for select using(auth.uid()=user_id or public.is_admin());
drop policy if exists payment_insert on public.payment_submissions;
create policy payment_insert on public.payment_submissions for insert with check(auth.uid()=user_id);
drop policy if exists payment_admin_update on public.payment_submissions;
create policy payment_admin_update on public.payment_submissions for update using(public.is_admin()) with check(public.is_admin());
drop policy if exists credit_self on public.credit_events;
create policy credit_self on public.credit_events for select using(auth.uid()=user_id or public.is_admin());
drop policy if exists usage_self on public.tool_usage;
create policy usage_self on public.tool_usage for select using(auth.uid()=user_id or public.is_admin());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$
declare admin_exists boolean;
begin
  perform pg_advisory_xact_lock(74020425);
  select exists(select 1 from public.profiles where role='admin') into admin_exists;
  insert into public.profiles(id,full_name,role) values(
    new.id, coalesce(new.raw_user_meta_data->>'full_name',''), case when not admin_exists then 'admin' else 'user' end
  ) on conflict(id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users for each row execute function public.handle_new_user();

-- Backfill existing accounts when this migration is applied after users already exist.
insert into public.profiles(id,full_name,role)
select u.id, coalesce(u.raw_user_meta_data->>'full_name',''),
       case when row_number() over(order by u.created_at,u.id)=1 then 'admin' else 'user' end
from auth.users u
where not exists(select 1 from public.profiles p where p.id=u.id)
on conflict(id) do nothing;
-- If a profile already exists for the first account, ensure the first account remains an owner.
update public.profiles p set role='admin'
where p.id=(select id from auth.users order by created_at,id limit 1)
  and not exists(select 1 from public.profiles x where x.role='admin');


create or replace function public.refresh_monthly_credits()
returns void language plpgsql security definer set search_path=public
as $$
begin
  update public.profiles
  set credits_month=to_char(date_trunc('month',now()),'YYYY-MM'),
      monthly_ai_used=0, monthly_tool_used=0, updated_at=now()
  where id=auth.uid()
    and credits_month<>to_char(date_trunc('month',now()),'YYYY-MM');
end $$;

create or replace function public.consume_credit(p_tool text,p_kind text)
returns jsonb language plpgsql security definer set search_path=public
as $$
declare p public.profiles%rowtype; current_month text:=to_char(date_trunc('month',now()),'YYYY-MM'); lim integer;
begin
 select * into p from public.profiles where id=auth.uid() for update;
 if p.id is null then raise exception 'Profile not found'; end if;
 if p.credits_month<>current_month then update public.profiles set credits_month=current_month,monthly_ai_used=0,monthly_tool_used=0 where id=auth.uid(); p.monthly_ai_used:=0;p.monthly_tool_used:=0; end if;
 if p.plan='unlimited' or p.plan='business' or p.role='admin' then
   insert into public.credit_events(user_id,tool,credits) values(auth.uid(),p_tool,0);
   return jsonb_build_object('allowed',true,'remaining',-1,'plan',p.plan);
 end if;
 if p_kind='ai_resume' then lim:=10; if p.monthly_ai_used>=lim then return jsonb_build_object('allowed',false,'remaining',0,'limit',lim); end if;
   update public.profiles set monthly_ai_used=monthly_ai_used+1 where id=auth.uid();
   insert into public.credit_events(user_id,tool) values(auth.uid(),p_tool);
   return jsonb_build_object('allowed',true,'remaining',lim-p.monthly_ai_used-1,'limit',lim);
 else lim:=15; if p.monthly_tool_used>=lim then return jsonb_build_object('allowed',false,'remaining',0,'limit',lim); end if;
   update public.profiles set monthly_tool_used=monthly_tool_used+1 where id=auth.uid();
   insert into public.credit_events(user_id,tool) values(auth.uid(),p_tool);
   return jsonb_build_object('allowed',true,'remaining',lim-p.monthly_tool_used-1,'limit',lim);
 end if;
end $$;

create or replace function public.approve_payment(p_payment uuid,p_note text default '')
returns void language plpgsql security definer set search_path=public
as $$
declare pay public.payment_submissions%rowtype;
begin
 if not public.is_admin() then raise exception 'Admin only'; end if;
 select * into pay from public.payment_submissions where id=p_payment for update;
 if pay.id is null then raise exception 'Payment not found'; end if;
 update public.payment_submissions set status='approved',admin_note=p_note,reviewed_by=auth.uid(),reviewed_at=now() where id=p_payment;
 update public.profiles set plan=pay.plan,monthly_ai_used=0,monthly_tool_used=0,updated_at=now() where id=pay.user_id;
end $$;

create or replace function public.reject_payment(p_payment uuid,p_note text default '')
returns void language plpgsql security definer set search_path=public
as $$
begin
 if not public.is_admin() then raise exception 'Admin only'; end if;
 update public.payment_submissions set status='rejected',admin_note=p_note,reviewed_by=auth.uid(),reviewed_at=now() where id=p_payment;
end $$;

insert into public.app_settings(key,value) values
('payment', '{"upi_id":"dhalak65@okicici","merchant_name":"QuadraFroyn Solutions","unlimited_price":199,"business_price":0}'::jsonb),
('branding','{"name":"QuadraResume","company":"QuadraFroyn Solutions","support_email":""}'::jsonb)
on conflict(key) do nothing;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('payment-proofs','payment-proofs',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf']::text[])
on conflict(id) do nothing;
drop policy if exists payment_proof_insert on storage.objects;
create policy payment_proof_insert on storage.objects for insert to authenticated with check(bucket_id='payment-proofs' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists payment_proof_select on storage.objects;
create policy payment_proof_select on storage.objects for select to authenticated using(bucket_id='payment-proofs' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));

-- Monthly renewal is handled lazily by consume_credit, so no cron extension is required.

update public.app_settings set value = jsonb_set(value,'{upi_id}',to_jsonb('dhalak65@okicici'::text),true) where key='payment' and coalesce(value->>'upi_id','')='';
