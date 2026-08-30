import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

// Real PostgreSQL execution, not string matching. Auth API/session issuance is
// deliberately not emulated: these minimal auth tables supply JWT test context.
let db,orgA,orgB,customerA,customerB,dealB;
const a='10000000-0000-4000-8000-000000000001',b='10000000-0000-4000-8000-000000000002',admin='10000000-0000-4000-8000-000000000003',pending='10000000-0000-4000-8000-000000000004';
const sid=id=>id.replace('10000000','20000000');
async function asUser(id,sql,params=[]){
 await db.exec('begin; set local role authenticated');
 await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:id,session_id:sid(id),role:'authenticated',user_metadata:{role:'super_admin',status:'active'}})]);
 try{const r=await db.query(sql,params);await db.exec('commit');return r;}catch(e){await db.exec('rollback');throw e;}
}
before(async()=>{
 db=new PGlite();
 await db.exec(`create role anon nologin;create role authenticated nologin;create schema auth;
 create table auth.users(id uuid primary key,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');
 create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz);
 create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
 create function auth.uid() returns uuid language sql stable as $$select (auth.jwt()->>'sub')::uuid$$;
 grant usage on schema auth,public to authenticated,anon;grant execute on function auth.jwt(),auth.uid() to authenticated,anon;`);
 for(const file of (await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile(new URL(`../supabase/migrations/${file}`,import.meta.url),'utf8'));
 for(const id of [a,b,admin,pending]){
 await db.query("insert into auth.users(id,email_confirmed_at,raw_user_meta_data) values($1,now(),'{\"role\":\"super_admin\",\"status\":\"active\",\"first_name\":\"Test\"}')",[id]);
 await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[sid(id),id]);
 }
 await db.query("update public.profiles set status='active' where user_id<>$1",[pending]);
 await db.query("update public.profiles set role='admin' where user_id=$1",[admin]);
 orgA=(await db.query('select organization_id from public.organization_members where user_id=$1',[a])).rows[0].organization_id;
 orgB=(await db.query('select organization_id from public.organization_members where user_id=$1',[b])).rows[0].organization_id;
 customerA=(await asUser(a,"insert into customers(organization_id,first_name,last_name) values($1,'Fiktiv','Alpha') returning id",[orgA])).rows[0].id;
 customerB=(await asUser(b,"insert into customers(organization_id,first_name,last_name) values($1,'Fiktiv','Beta') returning id",[orgB])).rows[0].id;
 dealB=(await asUser(b,"insert into deals(organization_id,customer_id,title) values($1,$2,'Testvermittlung B') returning id",[orgB,customerB])).rows[0].id;
});
after(async()=>{await db?.close();});
test('all exposed business tables have RLS enabled',async()=>{const r=await db.query("select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity");assert.equal(r.rows.length,0);});
test('registration ignores attacker-controlled admin/active metadata',async()=>{const p=(await asUser(pending,'select role,status from profiles where user_id=$1',[pending])).rows[0];assert.deepEqual(p,{role:'partner',status:'pending'});});
test('TEST 1: partner A cannot read customer B',async()=>{assert.equal((await asUser(a,'select * from customers where id=$1',[customerB])).rows.length,0);});
test('TEST 2: partner A cannot update deal B',async()=>{assert.equal((await asUser(a,"update deals set title='Attack' where id=$1 returning id",[dealB])).rows.length,0);});
test('TEST 3: forged organization on insert is denied',async()=>{await assert.rejects(asUser(a,"insert into customers(organization_id,first_name,last_name) values($1,'Attack','Denied')",[orgB]),/Access denied|row-level/);});
test('TEST 4: partner cannot self-activate',async()=>{await assert.rejects(asUser(pending,"update profiles set status='active' where user_id=$1",[pending]),/permission denied/);});
test('TEST 5: partner cannot self-promote',async()=>{await assert.rejects(asUser(a,"update profiles set role='super_admin' where user_id=$1",[a]),/permission denied/);});
test('ownership cannot be reassigned on UPDATE',async()=>{await assert.rejects(asUser(a,'update customers set organization_id=$1 where id=$2',[orgB,customerA]),/Access denied|Immutable|row-level/);});
test('cross-tenant customer FK is rejected for a deal',async()=>{await assert.rejects(asUser(a,"insert into deals(organization_id,customer_id,title) values($1,$2,'Invalid')",[orgA,customerB]),/foreign key/);});
test('partners cannot invoke admin RPC or private implementation',async()=>{await assert.rejects(asUser(a,"select review_partner($1,'suspended')",[b]),/Access denied/);await assert.rejects(asUser(a,"select private.review_partner($1,'active')",[pending]),/Access denied/);});
test('membership and organisation mutation is denied',async()=>{await assert.rejects(asUser(a,'update organization_members set organization_id=$1 where user_id=$2',[orgB,a]),/permission denied/);await assert.rejects(asUser(a,"insert into organizations(name) values('Fake')"),/permission denied/);});
test('audit logs and status history are append-only for partners and admins',async()=>{for(const who of [a,admin])for(const table of ['audit_logs','deal_status_history']){await assert.rejects(asUser(who,`delete from ${table}`),/permission denied/);await assert.rejects(asUser(who,`update ${table} set id=gen_random_uuid()`),/permission denied/);}});
test('normal customer creation and editing emits audit events without PII',async()=>{await asUser(a,"update customers set internal_notes='PRIVATE TEST NOTE' where id=$1",[customerA]);const r=await asUser(a,'select action,metadata from audit_logs where entity_id=$1',[customerA]);assert(r.rows.some(r=>r.action==='customer_created'));assert(r.rows.some(r=>r.action==='customer_updated'));assert(!JSON.stringify(r.rows).includes('PRIVATE TEST NOTE'));});
test('deal numbers unique, amounts aggregated, history generated automatically',async()=>{
 const ids=[];for(let i=0;i<3;i++){const r=await asUser(a,"insert into deals(organization_id,customer_id,title,investment_amount) values($1,$2,'Fiktiver Vorgang',100.25) returning id,deal_number",[orgA,customerA]);ids.push(r.rows[0]);}
 assert.equal(new Set(ids.map(x=>x.deal_number)).size,3);assert.match(ids[0].deal_number,/^NN-\d{4}-\d+$/);
 await asUser(a,"update deals set status='submitted' where id=$1",[ids[0].id]);
 const history=await asUser(a,'select old_status,new_status from deal_status_history where deal_id=$1 order by changed_at',[ids[0].id]);assert.equal(history.rows.length,2);assert.equal(history.rows[1].old_status,'draft');assert.equal(history.rows[1].new_status,'submitted');
 assert.equal(Number((await asUser(a,'select deal_volume($1) as volume',[orgA])).rows[0].volume),300.75);
 assert.equal(Number((await asUser(a,'select deal_volume($1) as volume',[orgB])).rows[0].volume),0);
});
test('deal note organization enforced and author derived from session',async()=>{await assert.rejects(asUser(a,"insert into deal_notes(organization_id,deal_id,content) values($1,$2,'No access')",[orgA,dealB]),/foreign key/);const note=await asUser(b,"insert into deal_notes(organization_id,deal_id,content,created_by) values($1,$2,'Test note',$3) returning created_by",[orgB,dealB,a]);assert.equal(note.rows[0].created_by,b);});
test('tasks inherit deal customer, enforce assignee tenancy and track completion',async()=>{const task=await asUser(b,"insert into tasks(organization_id,title,due_date,deal_id) values($1,'Testaufgabe',current_date-1,$2) returning id,customer_id",[orgB,dealB]);assert.equal(task.rows[0].customer_id,customerB);const id=task.rows[0].id;await assert.rejects(asUser(b,'update tasks set assigned_to=$1 where id=$2',[a,id]),/foreign key/);const completed=await asUser(b,"update tasks set status='completed' where id=$1 returning completed_at",[id]);assert(completed.rows[0].completed_at);assert.equal((await asUser(b,"select * from audit_logs where entity_id=$1 and action='task_completed'",[id])).rows.length,1);await asUser(b,"update tasks set status='open' where id=$1",[id]);assert.equal((await asUser(b,'select completed_at from tasks where id=$1',[id])).rows[0].completed_at,null);});
test('pending cannot access business data, onboarding -> review -> admin approval',async()=>{
 const org=(await db.query('select organization_id from organization_members where user_id=$1',[pending])).rows[0].organization_id;
 await assert.rejects(asUser(pending,"insert into customers(organization_id,first_name,last_name) values($1,'Denied','Pending')",[org]),/Access denied/);
 await assert.rejects(asUser(admin,"select review_partner($1,'active')",[pending]),/incomplete/);
 const payload={first_name:'Fiktiv',last_name:'Partner',company_name:'Fiktiv GmbH',street:'Teststraße',house_number:'1',postal_code:'12345',city:'Testort',country:'Deutschland',professional_title:'Testtätigkeit',consent:'yes',status:'active',role:'admin',organization_id:orgB};
 await asUser(pending,'select save_onboarding($1::jsonb,true)',[JSON.stringify(payload)]);
 assert.equal((await asUser(pending,'select status from profiles where user_id=$1',[pending])).rows[0].status,'under_review');
 await assert.rejects(asUser(pending,'select save_onboarding($1::jsonb,true)',[JSON.stringify(payload)]),/locked/);
 await asUser(admin,"select review_partner($1,'active')",[pending]);
 assert.equal((await asUser(pending,'select status from profiles where user_id=$1',[pending])).rows[0].status,'active');
 const logs=await asUser(admin,'select action from audit_logs where entity_id=$1',[pending]);assert(logs.rows.some(x=>x.action==='onboarding_submitted'));assert(logs.rows.some(x=>x.action==='partner_activated'));
});
test('suspension applies immediately even with old active JWT metadata',async()=>{await asUser(admin,"select review_partner($1,'suspended')",[a]);assert.equal((await asUser(a,'select * from customers')).rows.length,0);await assert.rejects(asUser(a,"update customers set last_name='Attack' where id=$1 returning id",[customerA]).then(r=>{if(r.rows.length===0)throw new Error('Access denied');}),/Access denied/);await db.query("update profiles set status='active' where user_id=$1",[a]);});
test('static audit: all ten tables deny anonymous SELECT',async()=>{for(const table of ['profiles','organizations','organization_members','partner_profiles','customers','deals','tasks','deal_notes','audit_logs','deal_status_history']){await db.exec('begin;set local role anon');try{await assert.rejects(db.query('select * from '+table),/permission denied/);}finally{await db.exec('rollback');}}});
test('static audit: foreign customer read/update/delete and own deletion denied',async()=>{assert.equal((await asUser(a,'select * from customers where id=$1',[customerB])).rows.length,0);assert.equal((await asUser(a,"update customers set last_name='Denied' where id=$1 returning id",[customerB])).rows.length,0);for(const id of [customerA,customerB])await assert.rejects(asUser(a,'delete from customers where id=$1',[id]),/permission denied/);});
test('static audit: admin and super_admin escalation and approval of another partner denied',async()=>{for(const role of ['admin','super_admin'])await assert.rejects(asUser(a,'update profiles set role=$1 where user_id=$2',[role,a]),/permission denied/);await assert.rejects(asUser(a,"select review_partner($1,'active')",[b]),/Access denied/);await assert.rejects(asUser(a,"update partner_profiles set submitted_at=now() where user_id=$1",[a]),/permission denied/);});
test('static audit: forged audit/history inserts are denied',async()=>{await assert.rejects(asUser(a,"insert into audit_logs(organization_id,actor_id,action,entity_type,entity_id) values($1,$2,'partner_activated','profiles',$2)",[orgB,b]),/permission denied/);await assert.rejects(asUser(a,"insert into deal_status_history(organization_id,deal_id,new_status,changed_by) values($1,$2,'completed',$3)",[orgB,dealB,b]),/permission denied/);});
test('static audit: task cross-tenant customer/deal/assignee rejected',async()=>{await assert.rejects(asUser(a,"insert into tasks(organization_id,title,due_date,customer_id) values($1,'Test',current_date,$2)",[orgA,customerB]),/foreign key/);await assert.rejects(asUser(a,"insert into tasks(organization_id,title,due_date,deal_id) values($1,'Test',current_date,$2)",[orgA,dealB]),/Invalid task relation/);await assert.rejects(asUser(a,"insert into tasks(organization_id,title,due_date,assigned_to) values($1,'Test',current_date,$2)",[orgA,b]),/foreign key/);});
test('static audit: invoker POST search cannot bypass RLS; hostile SQL and payload rejected',async()=>{const r=(await asUser(a,"select search_records('customers','Beta') as result")).rows[0].result;assert.equal(r.count,0);const own=(await asUser(a,"select search_records('customers','Alpha') as result")).rows[0].result;assert.equal(own.count,1);assert.equal(own.rows[0].id,customerA);await assert.rejects(asUser(a,"select search_records('profiles')"),/Access denied/);await assert.rejects(asUser(a,"select search_records('customers','','id; drop table profiles')"),/Invalid sort/);await assert.rejects(asUser(a,"select search_records('customers',$1)",['x'.repeat(101)]),/Invalid search/);await assert.rejects(asUser(a,"select search_records('customers','','updated_at','','',0)"),/Invalid search/);});
test('static audit: null onboarding submission and invalid database values rejected',async()=>{await assert.rejects(asUser(a,"select save_onboarding('{}',null)"),/Invalid payload/);await assert.rejects(asUser(a,"insert into customers(organization_id,first_name,last_name,email) values($1,'Test','Test','invalid')",[orgA]),/check constraint/);for(const value of ['-1','NaN','1000000000000'])await assert.rejects(asUser(a,"insert into deals(organization_id,customer_id,title,investment_amount) values($1,$2,'Test',$3)",[orgA,customerA,value]),/check constraint|overflow/);});
test('static catalog audit: definer functions private, fixed search_path, no anonymous execution',async()=>{const functions=await db.query("select n.nspname,p.proname,p.prosecdef,p.proconfig,has_function_privilege('anon',p.oid,'EXECUTE') as anon_exec from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private')");for(const f of functions.rows){assert.equal(f.anon_exec,false,f.proname);assert(f.proconfig?.some(x=>x.startsWith('search_path=')),f.proname);if(f.prosecdef)assert.equal(f.nspname,'private');}assert.equal((await db.query("select * from pg_views where schemaname='public'")).rows.length,0);});
test('revoked/expired/unverified session cannot read tenant data',async()=>{await db.query('delete from auth.sessions where user_id=$1',[a]);assert.equal((await asUser(a,'select * from customers')).rows.length,0);await db.query('insert into auth.sessions(id,user_id,not_after) values($1,$2,now()-interval \'1 hour\')',[sid(a),a]);assert.equal((await asUser(a,'select * from customers')).rows.length,0);await db.query('update auth.sessions set not_after=null where user_id=$1',[a]);await db.query('update auth.users set email_confirmed_at=null where id=$1',[a]);assert.equal((await asUser(a,'select * from customers')).rows.length,0);});
test('anonymous cannot access exposed data or privileged RPCs',async()=>{await db.exec('begin;set local role anon');try{await assert.rejects(db.query('select * from customers'),/permission denied/);}finally{await db.exec('rollback');}await db.exec('begin;set local role anon');try{await assert.rejects(db.query("select review_partner($1,'active')",[a]),/permission denied/);}finally{await db.exec('rollback');}});
