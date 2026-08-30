-- Static browser access: preserve all existing RLS, strengthen input validation.
begin;
revoke create on schema public from public, anon, authenticated;
revoke all on all tables in schema public from public;
alter default privileges in schema public revoke all on tables from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter table public.customers add constraint customers_email_format check (email is null or email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$');
alter table public.deals add constraint deals_finite_amount check (investment_amount is null or investment_amount between 0 and 999999999999.99);
create index history_actor_idx on public.deal_status_history(changed_by);
create or replace function private.save_onboarding(payload jsonb,submit boolean) returns void language plpgsql security definer set search_path='' as $$
 declare p public.profiles; org uuid;
 begin
 if submit is null or jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>16384 then raise exception 'Invalid payload' using errcode='23514';end if;
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
create or replace function private.review_partner(target uuid,new_status public.account_status) returns void language plpgsql security definer set search_path='' as $$
 declare p public.profiles;
 begin
 if new_status is null or not private.is_admin() or target=auth.uid() or new_status='pending' then raise exception 'Access denied' using errcode='42501';end if;
 select * into p from public.profiles where user_id=target for update;
 if not found or p.role<>'partner' then raise exception 'Access denied' using errcode='42501';end if;
 if new_status='active' and not exists(select 1 from public.partner_profiles where user_id=target and submitted_at is not null and terms_accepted_at is not null) then raise exception 'Onboarding incomplete' using errcode='23514';end if;
 update public.profiles set status=new_status where user_id=target;
 end $$;

-- POST RPC keeps sensitive search terms out of URL query strings.
-- SECURITY INVOKER is essential: SQL runs as the ordinary authenticated user.
create function public.search_records(section text, term text default '', sort_key text default 'updated_at', filter_status text default '', task_view text default '', page_index integer default 1)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare predicate text := 'true'; ordering text; result jsonb; day date := (now() at time zone 'Europe/Berlin')::date;
begin
 if not private.session_valid() or section is null or section not in ('customers','deals','tasks') then raise exception 'Access denied' using errcode='42501'; end if;
 if term is null or length(term)>100 or page_index is null or page_index not between 1 and 100000 then raise exception 'Invalid search' using errcode='23514';end if;
 if sort_key is null or sort_key not in ('updated_at','created_at','last_name','title','due_date') or (sort_key='last_name' and section<>'customers') or (sort_key='title' and section='customers') or (sort_key='due_date' and section<>'tasks') then raise exception 'Invalid sort' using errcode='23514';end if;
 if section='customers' then predicate := '(first_name ilike $1 or last_name ilike $1 or email ilike $1)';
 else predicate := 'title ilike $1'; end if;
 if section='deals' and coalesce(filter_status,'')<>'' then predicate:=predicate||' and status = $2::public.deal_status';end if;
 if section='tasks' then
 if task_view='done' then predicate:=predicate||' and status in (''completed'',''cancelled'')';
 else
 predicate:=predicate||' and status in (''open'',''in_progress'')';
 if task_view='today' then predicate:=predicate||' and due_date=$3';
 elsif task_view='overdue' then predicate:=predicate||' and due_date<$3';
 elsif task_view='week' then predicate:=predicate||' and due_date between $3 and $4';
 elsif task_view='later' then predicate:=predicate||' and due_date>$4';
 elsif coalesce(task_view,'')<>'' then raise exception 'Invalid view' using errcode='23514';end if;
 end if;end if;
 ordering:=format('%I %s, id',sort_key,case when sort_key in ('title','last_name','due_date') then 'asc' else 'desc' end);
 execute format('with filtered as (select * from public.%I where %s), paged as (select * from filtered order by %s limit 20 offset $5) select jsonb_build_object(''rows'',coalesce((select jsonb_agg(to_jsonb(p)%s) from paged p),''[]''::jsonb),''count'',(select count(*) from filtered),''page'',$6)',section,predicate,ordering,case when section='customers' then ' || jsonb_build_object(''deals'',jsonb_build_array(jsonb_build_object(''count'',(select count(*) from public.deals d where d.customer_id=p.id and d.organization_id=p.organization_id))))' else '' end)
 into result using '%'||replace(replace(replace(term,E'\\',E'\\\\'),'%',E'\\%'),'_',E'\\_')||'%',filter_status,day,day+(7-extract(isodow from day)::int),(page_index-1)*20,page_index;
 return result;
end $$;
revoke all on function public.search_records(text,text,text,text,text,integer) from public,anon;
grant execute on function public.search_records(text,text,text,text,text,integer) to authenticated;
comment on function public.search_records(text,text,text,text,text,integer) is 'Bounded search via POST; caller RLS applies; never log arguments.';
commit;
