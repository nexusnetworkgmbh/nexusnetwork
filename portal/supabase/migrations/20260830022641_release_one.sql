-- Release 1. Execute once on a fresh Supabase project. All app requests use
-- authenticated + RLS; the service key is never used for portal CRUD.
begin;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
create type public.account_status as enum ('pending','under_review','active','suspended','rejected');
create type public.app_role as enum ('partner','admin','compliance','finance','support','super_admin');
create type public.deal_status as enum ('draft','documents_missing','ready','submitted','in_review','question','accepted','completed','rejected','cancelled');
create type public.task_status as enum ('open','in_progress','completed','cancelled');
create type public.task_priority as enum ('low','normal','high','urgent');
create table public.profiles (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
 first_name text not null default '' check(length(first_name)<=100), last_name text not null default '' check(length(last_name)<=100),
 phone text check(length(phone)<=50), avatar_url text check(length(avatar_url)<=500),
 status public.account_status not null default 'pending', role public.app_role not null default 'partner',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.organizations (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 200),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.organization_members (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 user_id uuid not null references auth.users(id), role text not null default 'member' check(role in ('owner','member')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,user_id)
);
create index members_user_idx on public.organization_members(user_id,organization_id);
create table public.partner_profiles (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 user_id uuid not null unique references auth.users(id), company_name text not null default '' check(length(company_name)<=200),
 legal_form text check(length(legal_form)<=100), street text not null default '' check(length(street)<=200),
 house_number text not null default '' check(length(house_number)<=30), postal_code text not null default '' check(length(postal_code)<=20),
 city text not null default '' check(length(city)<=100), country text not null default 'Deutschland' check(length(country)<=100),
 professional_title text not null default '' check(length(professional_title)<=200), registration_number text check(length(registration_number)<=100),
 responsible_authority text check(length(responsible_authority)<=200), onboarding_completed_at timestamptz, submitted_at timestamptz,
 terms_accepted_at timestamptz, terms_version text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(organization_id,user_id) references public.organization_members(organization_id,user_id)
);
create index partners_org_idx on public.partner_profiles(organization_id);
create table public.customers (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 first_name text not null check(length(trim(first_name)) between 1 and 100), last_name text not null check(length(trim(last_name)) between 1 and 100),
 email text check(length(email)<=254), phone text check(length(phone)<=50), street text check(length(street)<=200),
 postal_code text check(length(postal_code)<=20), city text check(length(city)<=100), country text check(length(country)<=100),
 internal_notes text check(length(internal_notes)<=5000), created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id)
);
create index customers_org_name_idx on public.customers(organization_id,last_name,first_name,id);
create index customers_creator_idx on public.customers(created_by);
create sequence private.deal_number_seq;
create table public.deals (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 customer_id uuid not null, created_by uuid not null default auth.uid() references auth.users(id), deal_number text not null unique,
 title text not null check(length(trim(title)) between 1 and 200), product_name text check(length(product_name)<=200), provider_name text check(length(provider_name)<=200),
 investment_amount numeric(14,2) check(investment_amount>=0), status public.deal_status not null default 'draft', internal_notes text check(length(internal_notes)<=5000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id),
 foreign key(organization_id,customer_id) references public.customers(organization_id,id)
);
create index deals_org_status_idx on public.deals(organization_id,status,created_at desc);
create index deals_customer_idx on public.deals(organization_id,customer_id);
create index deals_creator_idx on public.deals(created_by);
create table public.deal_status_history (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), deal_id uuid not null,
 old_status public.deal_status, new_status public.deal_status not null, changed_by uuid references auth.users(id), changed_at timestamptz not null default now(),
 foreign key(organization_id,deal_id) references public.deals(organization_id,id)
);
create index history_deal_idx on public.deal_status_history(organization_id,deal_id,changed_at);
create table public.deal_notes (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), deal_id uuid not null,
 created_by uuid not null default auth.uid() references auth.users(id), content text not null check(length(trim(content)) between 1 and 5000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(organization_id,deal_id) references public.deals(organization_id,id)
);
create index notes_deal_idx on public.deal_notes(organization_id,deal_id,created_at);
create index notes_creator_idx on public.deal_notes(created_by);
create table public.tasks (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 title text not null check(length(trim(title)) between 1 and 200), description text check(length(description)<=5000), due_date date not null,
 priority public.task_priority not null default 'normal', status public.task_status not null default 'open', customer_id uuid, deal_id uuid,
 assigned_to uuid not null default auth.uid(), created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), completed_at timestamptz,
 foreign key(organization_id,customer_id) references public.customers(organization_id,id),
 foreign key(organization_id,deal_id) references public.deals(organization_id,id),
 foreign key(organization_id,assigned_to) references public.organization_members(organization_id,user_id)
);
create index tasks_due_idx on public.tasks(organization_id,status,due_date);
create index tasks_customer_idx on public.tasks(organization_id,customer_id);
create index tasks_deal_idx on public.tasks(organization_id,deal_id);
create index tasks_assignee_idx on public.tasks(organization_id,assigned_to);
create index tasks_creator_idx on public.tasks(created_by);
create table public.audit_logs (
 id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id), actor_id uuid,
 action text not null, entity_type text not null, entity_id uuid not null, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
create index audit_org_idx on public.audit_logs(organization_id,created_at desc);
create index audit_entity_idx on public.audit_logs(entity_id,created_at desc);

-- Definer helpers live outside exposed schemas and inspect DB-owned state,
-- never editable JWT user_metadata. A revoked session fails even before JWT expiry.
create function private.session_valid() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from auth.users u join auth.sessions s on s.user_id=u.id
 where u.id=auth.uid() and u.email_confirmed_at is not null and s.id::text=auth.jwt()->>'session_id'
 and (s.not_after is null or s.not_after>now()))
$$;
create function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select private.session_valid() and exists(select 1 from public.profiles where user_id=auth.uid() and status='active' and role in ('admin','super_admin'))
$$;
create function private.member_of(org uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.session_valid() and exists(select 1 from public.organization_members where user_id=auth.uid() and organization_id=org)
$$;
create function private.can_work(org uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.member_of(org) and exists(select 1 from public.profiles where user_id=auth.uid() and status='active')
$$;
create function private.peer(uid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.session_valid() and exists(select 1 from public.organization_members m where m.user_id=uid and private.can_work(m.organization_id))
$$;

create function private.bootstrap_user() returns trigger language plpgsql security definer set search_path='' as $$
 declare org uuid;
 begin
 insert into public.profiles(user_id,first_name,last_name) values(new.id,left(coalesce(new.raw_user_meta_data->>'first_name',''),100),left(coalesce(new.raw_user_meta_data->>'last_name',''),100));
 insert into public.organizations(name) values('Neue Partnerorganisation') returning id into org;
 insert into public.organization_members(organization_id,user_id,role) values(org,new.id,'owner');
 insert into public.partner_profiles(organization_id,user_id) values(org,new.id);
 insert into public.audit_logs(organization_id,actor_id,action,entity_type,entity_id) values(org,new.id,'partner_registered','profiles',new.id);
 return new;
 end $$;
create trigger bootstrap_user after insert on auth.users for each row execute function private.bootstrap_user();

create function private.stamp() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end $$;
create function private.guard_business() returns trigger language plpgsql security definer set search_path='' as $$
 declare sequence_text text;
 begin
 if not private.can_work(new.organization_id) then raise exception 'Access denied' using errcode='42501'; end if;
 if TG_OP='INSERT' then new.created_by=auth.uid();new.created_at=now();
 else
 if new.organization_id is distinct from old.organization_id or new.id is distinct from old.id or new.created_by is distinct from old.created_by or new.created_at is distinct from old.created_at then raise exception 'Immutable ownership' using errcode='42501';end if;
 end if;
 if TG_TABLE_NAME='deals' then
 if TG_OP='INSERT' then sequence_text=nextval('private.deal_number_seq')::text;new.deal_number='NN-'||extract(year from now())::text||'-'||lpad(sequence_text,greatest(9,length(sequence_text)),'0');
 elsif new.deal_number is distinct from old.deal_number then raise exception 'Immutable number' using errcode='42501';end if;
 end if;
 if TG_TABLE_NAME='tasks' then
 if new.deal_id is not null then
 if new.customer_id is null then select customer_id into new.customer_id from public.deals where id=new.deal_id and organization_id=new.organization_id; end if;
 if not exists(select 1 from public.deals where id=new.deal_id and organization_id=new.organization_id and customer_id=new.customer_id) then raise exception 'Invalid task relation' using errcode='23514'; end if;
 end if;
 if new.status='completed' then
 if TG_OP='UPDATE' then new.completed_at=coalesce(old.completed_at,now());else new.completed_at=now();end if;
 else new.completed_at=null;end if;
 end if;
 return new;
 end $$;
create function private.audit_business() returns trigger language plpgsql security definer set search_path='' as $$
 declare event text;
 begin
 event=case TG_TABLE_NAME when 'customers' then 'customer' when 'deals' then 'deal' when 'tasks' then 'task' else 'deal_note' end||case when TG_OP='INSERT' then '_created' else '_updated' end;
 if TG_TABLE_NAME='deals' then
 if TG_OP='INSERT' then insert into public.deal_status_history(organization_id,deal_id,new_status,changed_by) values(new.organization_id,new.id,new.status,auth.uid());
 elsif new.status is distinct from old.status then
 insert into public.deal_status_history(organization_id,deal_id,old_status,new_status,changed_by) values(new.organization_id,new.id,old.status,new.status,auth.uid());event='deal_status_changed';end if;
 end if;
 if TG_TABLE_NAME='tasks' and TG_OP='UPDATE' then if new.status='completed' and old.status<>'completed' then event='task_completed';end if;end if;
 insert into public.audit_logs(organization_id,actor_id,action,entity_type,entity_id) values(new.organization_id,auth.uid(),event,TG_TABLE_NAME,new.id);
 return new;
 end $$;
create function private.audit_profile() returns trigger language plpgsql security definer set search_path='' as $$
 declare org uuid; event text;
 begin
 if new.status is distinct from old.status or new.role is distinct from old.role then
 select organization_id into org from public.organization_members where user_id=new.user_id order by created_at limit 1;
 event=case when new.role is distinct from old.role then 'partner_role_changed' when new.status='active' then 'partner_activated' when new.status='suspended' then 'partner_suspended' when new.status='under_review' and old.status='pending' then 'onboarding_submitted' else 'partner_status_changed' end;
 insert into public.audit_logs(organization_id,actor_id,action,entity_type,entity_id,metadata) values(org,auth.uid(),event,'profiles',new.user_id,jsonb_build_object('old_status',old.status,'new_status',new.status,'old_role',old.role,'new_role',new.role));
 end if;return new;
 end $$;
create trigger audit_profile after update on public.profiles for each row execute function private.audit_profile();

-- Narrow RPC wrappers expose only explicitly authorized operations.
create function private.save_onboarding(payload jsonb,submit boolean) returns void language plpgsql security definer set search_path='' as $$
 declare p public.profiles; org uuid;
 begin
 if not private.session_valid() then raise exception 'Access denied' using errcode='42501';end if;
 select * into p from public.profiles where user_id=auth.uid() for update;
 if p.status<>'pending' then raise exception 'Onboarding locked' using errcode='42501';end if;
 if payload->>'consent'<>'yes' or payload->>'consent' is null then raise exception 'Consent required' using errcode='23514';end if;
 if submit and exists(select 1 from unnest(array['first_name','last_name','company_name','street','house_number','postal_code','city','country','professional_title']) key where coalesce(trim(payload->>key),'')='') then raise exception 'Required fields missing' using errcode='23514';end if;
 update public.profiles set first_name=coalesce(payload->>'first_name',''),last_name=coalesce(payload->>'last_name',''),phone=payload->>'phone' where user_id=auth.uid();
 update public.partner_profiles set company_name=coalesce(payload->>'company_name',''),legal_form=payload->>'legal_form',street=coalesce(payload->>'street',''),house_number=coalesce(payload->>'house_number',''),postal_code=coalesce(payload->>'postal_code',''),city=coalesce(payload->>'city',''),country=coalesce(payload->>'country',''),professional_title=coalesce(payload->>'professional_title',''),registration_number=payload->>'registration_number',responsible_authority=payload->>'responsible_authority',terms_accepted_at=coalesce(terms_accepted_at,now()),terms_version='release-1',submitted_at=case when submit then now() else null end,onboarding_completed_at=case when submit then now() else null end where user_id=auth.uid() returning organization_id into org;
 if coalesce(trim(payload->>'company_name'),'')<>'' then update public.organizations set name=payload->>'company_name' where id=org;end if;
 if submit then update public.profiles set status='under_review' where user_id=auth.uid();end if;
 end $$;
create function public.save_onboarding(payload jsonb,submit boolean default false) returns void language sql security invoker set search_path='' as $$select private.save_onboarding(payload,submit)$$;
create function private.review_partner(target uuid,new_status public.account_status) returns void language plpgsql security definer set search_path='' as $$
 declare p public.profiles;
 begin
 if not private.is_admin() or target=auth.uid() or new_status='pending' then raise exception 'Access denied' using errcode='42501';end if;
 select * into p from public.profiles where user_id=target for update;
 if not found or p.role<>'partner' then raise exception 'Access denied' using errcode='42501';end if;
 if new_status='active' and not exists(select 1 from public.partner_profiles where user_id=target and submitted_at is not null and terms_accepted_at is not null) then raise exception 'Onboarding incomplete' using errcode='23514';end if;
 update public.profiles set status=new_status where user_id=target;
 end $$;
create function public.review_partner(target uuid,new_status public.account_status) returns void language sql security invoker set search_path='' as $$select private.review_partner(target,new_status)$$;

do $$declare t text;begin
 foreach t in array array['profiles','organizations','organization_members','partner_profiles','customers','deals','deal_notes','tasks','audit_logs','deal_status_history'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 if t not in ('audit_logs','deal_status_history') then execute format('create trigger stamp before update on public.%I for each row execute function private.stamp()',t);end if;
 end loop;
 foreach t in array array['customers','deals','deal_notes','tasks'] loop
 execute format('create trigger guard_business before insert or update on public.%I for each row execute function private.guard_business()',t);
 execute format('create trigger audit_business after insert or update on public.%I for each row execute function private.audit_business()',t);
 execute format('create policy tenant_read on public.%I for select to authenticated using (private.can_work(organization_id))',t);
 execute format('create policy tenant_insert on public.%I for insert to authenticated with check (private.can_work(organization_id) and created_by=(select auth.uid()))',t);
 execute format('create policy tenant_update on public.%I for update to authenticated using (private.can_work(organization_id)) with check (private.can_work(organization_id))',t);
 execute format('grant select,insert,update on public.%I to authenticated',t);
 end loop;
end $$;
grant select on public.profiles,public.organizations,public.organization_members,public.partner_profiles,public.deal_status_history,public.audit_logs to authenticated;
grant update(first_name,last_name,phone) on public.profiles to authenticated;
create policy profile_read on public.profiles for select to authenticated using (((select private.session_valid()) and user_id=(select auth.uid())) or (select private.is_admin()) or private.peer(user_id));
create policy profile_update on public.profiles for update to authenticated using ((select private.session_valid()) and user_id=(select auth.uid())) with check ((select private.session_valid()) and user_id=(select auth.uid()));
create policy org_read on public.organizations for select to authenticated using (private.member_of(id) or (select private.is_admin()));
create policy member_read on public.organization_members for select to authenticated using (private.member_of(organization_id) or (select private.is_admin()));
create policy partner_read on public.partner_profiles for select to authenticated using (((select private.session_valid()) and user_id=(select auth.uid())) or (select private.is_admin()));
create policy history_read on public.deal_status_history for select to authenticated using (private.can_work(organization_id));
create policy audit_read on public.audit_logs for select to authenticated using (private.can_work(organization_id) or (select private.is_admin()));
-- No DELETE grants/policies: destructive workflows are deliberately not in R1.
revoke all on all functions in schema private from public,anon,authenticated;
grant execute on function private.session_valid(),private.is_admin(),private.member_of(uuid),private.can_work(uuid),private.peer(uuid),private.save_onboarding(jsonb,boolean),private.review_partner(uuid,public.account_status) to authenticated;
revoke all on function public.save_onboarding(jsonb,boolean),public.review_partner(uuid,public.account_status) from public,anon;
grant execute on function public.save_onboarding(jsonb,boolean),public.review_partner(uuid,public.account_status) to authenticated;
create function public.deal_volume(org uuid) returns numeric language sql stable security invoker set search_path='' as $$select coalesce(sum(investment_amount),0) from public.deals where organization_id=org and status not in ('rejected','cancelled')$$;
revoke all on function public.deal_volume(uuid) from public,anon;
grant execute on function public.deal_volume(uuid) to authenticated;
comment on column public.deals.product_name is 'R2: backfill product_id from verified product catalog; retain name snapshot.';
comment on column public.deals.provider_name is 'R2: backfill product_provider_id; retain provider snapshot.';
commit;
