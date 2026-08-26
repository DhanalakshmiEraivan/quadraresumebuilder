-- QuadraResume: Free plan = 5 total tool actions per calendar month.
-- AI and non-AI tools share the same monthly_tool_used counter.
create or replace function public.consume_credit(p_tool text,p_kind text)
returns jsonb language plpgsql security definer set search_path=public
as $$
declare
  p public.profiles%rowtype;
  current_month text:=to_char(date_trunc('month',now()),'YYYY-MM');
  lim integer:=5;
begin
  select * into p from public.profiles where id=auth.uid() for update;
  if p.id is null then raise exception 'Profile not found'; end if;
  if p.credits_month<>current_month then
    update public.profiles set credits_month=current_month,monthly_ai_used=0,monthly_tool_used=0,updated_at=now() where id=auth.uid();
    p.monthly_ai_used:=0; p.monthly_tool_used:=0; p.credits_month:=current_month;
  end if;
  if p.plan='unlimited' or p.plan='business' or p.role='admin' then
    insert into public.credit_events(user_id,tool,credits) values(auth.uid(),p_tool,0);
    return jsonb_build_object('allowed',true,'remaining',-1,'limit',lim,'plan',p.plan);
  end if;
  if p.monthly_tool_used>=lim then
    return jsonb_build_object('allowed',false,'remaining',0,'limit',lim,'plan',p.plan);
  end if;
  update public.profiles set monthly_tool_used=monthly_tool_used+1,updated_at=now() where id=auth.uid();
  insert into public.credit_events(user_id,tool,credits) values(auth.uid(),p_tool,1);
  return jsonb_build_object('allowed',true,'remaining',lim-p.monthly_tool_used-1,'limit',lim,'plan',p.plan);
end $$;

-- Initial ownership rule: the earliest registered account is the owner/admin.
-- Existing later accounts are normal users until explicitly promoted from the owner console.
update public.profiles set role='user'
where id<>(select id from auth.users order by created_at,id limit 1);
update public.profiles set role='admin'
where id=(select id from auth.users order by created_at,id limit 1);
