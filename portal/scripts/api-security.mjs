// Direct HTTP tests: no frontend or privileged key. ONLY a disposable synthetic-data project.
import assert from 'node:assert/strict';
const env=process.env;
if(env.SYNTHETIC_TEST_PROJECT!=='yes')throw new Error('Set SYNTHETIC_TEST_PROJECT=yes only for an isolated synthetic-data Supabase project.');
const base=env.NEXT_PUBLIC_SUPABASE_URL,key=env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(!base||!key?.startsWith('sb_publishable_'))throw new Error('Public Supabase URL/key required.');
const sessions={};let passed=0,failed=0;
async function request(route,method='GET',body,who){
 const response=await fetch(base+route,{method,headers:{apikey:key,'Content-Type':'application/json',Prefer:'return=representation',...(who?{Authorization:'Bearer '+sessions[who].access_token}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 let data;try{data=await response.json();}catch{data=null;}
 return {status:response.status,data};
}
async function ok(route,method,body,who){const r=await request(route,method,body,who);assert(r.status>=200&&r.status<300,'Expected authorized operation');return r.data;}
async function denied(route,method,body,who,integrity=false){const r=await request(route,method,body,who);assert([401,403].includes(r.status)||(r.status===200&&Array.isArray(r.data)&&r.data.length===0)||(integrity&&r.status===400&&['23503','23514'].includes(r.data?.code)),'Expected denial, never returned or modified a foreign row');}
for(const who of ['A','B','PENDING']){
 const login=await request('/auth/v1/token?grant_type=password','POST',{email:env['TEST_'+who+'_EMAIL'],password:env['TEST_'+who+'_PASSWORD']});
 assert.equal(login.status,200,'Test login failed (details intentionally redacted)');sessions[who]=login.data;
 const p=await ok('/rest/v1/profiles?user_id=eq.'+login.data.user.id,'GET',undefined,who);
 assert.equal(p[0]?.role,'partner','Tests must use ordinary partners');
 assert.equal(p[0]?.status,who==='PENDING'?'pending':'active','Fixture status incorrect');
}
const uid=who=>sessions[who].user.id;
const org={};
for(const who of ['A','B']){const m=await ok('/rest/v1/organization_members?user_id=eq.'+uid(who),'GET',undefined,who);assert.equal(m.length,1);org[who]=m[0].organization_id;}
assert.notEqual(org.A,org.B);
const a=(await ok('/rest/v1/customers','POST',{organization_id:org.A,first_name:'Synthetic',last_name:'Alpha'},'A'))[0];
const b=(await ok('/rest/v1/customers','POST',{organization_id:org.B,first_name:'Synthetic',last_name:'Beta'},'B'))[0];
const deal=(await ok('/rest/v1/deals','POST',{organization_id:org.B,customer_id:b.id,title:'Synthetic test deal'},'B'))[0];
async function check(name,fn){try{await fn();passed++;console.log('PASS '+name);}catch{failed++;console.log('FAIL '+name+' (details redacted)');}}
await check('01 anonymous customers',()=>denied('/rest/v1/customers'));
await check('02 anonymous deals',()=>denied('/rest/v1/deals'));
await check('03 foreign customer SELECT',()=>denied('/rest/v1/customers?id=eq.'+b.id,'GET',undefined,'A'));
await check('04 foreign customer UPDATE',()=>denied('/rest/v1/customers?id=eq.'+b.id,'PATCH',{last_name:'Denied'},'A'));
await check('05 foreign customer DELETE',()=>denied('/rest/v1/customers?id=eq.'+b.id,'DELETE',undefined,'A'));
await check('06 forged tenant INSERT',()=>denied('/rest/v1/customers','POST',{organization_id:org.B,first_name:'Denied',last_name:'Denied'},'A'));
await check('07 own row tenant reassignment',()=>denied('/rest/v1/customers?id=eq.'+a.id,'PATCH',{organization_id:org.B},'A'));
await check('08 self activation',()=>denied('/rest/v1/profiles?user_id=eq.'+uid('PENDING'),'PATCH',{status:'active'},'PENDING'));
await check('09 self admin',()=>denied('/rest/v1/profiles?user_id=eq.'+uid('A'),'PATCH',{role:'admin'},'A'));
await check('10 self super_admin',()=>denied('/rest/v1/profiles?user_id=eq.'+uid('A'),'PATCH',{role:'super_admin'},'A'));
await check('11 activate another partner',()=>denied('/rest/v1/rpc/review_partner','POST',{target:uid('PENDING'),new_status:'active'},'A'));
await check('12 admin RPC',()=>denied('/rest/v1/rpc/review_partner','POST',{target:uid('B'),new_status:'suspended'},'A'));
await check('13 alter audit',()=>denied('/rest/v1/audit_logs?organization_id=eq.'+org.A,'PATCH',{action:'forged'},'A'));
await check('14 delete audit',()=>denied('/rest/v1/audit_logs?organization_id=eq.'+org.A,'DELETE',undefined,'A'));
await check('15 alter history',()=>denied('/rest/v1/deal_status_history?deal_id=eq.'+deal.id,'PATCH',{new_status:'completed'},'B'));
await check('16 cross-tenant deal/customer',()=>denied('/rest/v1/deals','POST',{organization_id:org.A,customer_id:b.id,title:'Denied'},'A',true));
await check('17 cross-tenant task/deal',()=>denied('/rest/v1/tasks','POST',{organization_id:org.A,title:'Denied',due_date:'2030-01-01',deal_id:deal.id},'A',true));
await check('18 cross-tenant task/customer',()=>denied('/rest/v1/tasks','POST',{organization_id:org.A,title:'Denied',due_date:'2030-01-01',customer_id:b.id},'A',true));
await check('19 manipulated client metadata grants nothing',async()=>{await ok('/auth/v1/user','PUT',{data:{role:'super_admin',status:'active',organization_id:org.B}},'A');await denied('/rest/v1/rpc/review_partner','POST',{target:uid('PENDING'),new_status:'active'},'A');await denied('/rest/v1/customers?id=eq.'+b.id,'GET',undefined,'A');});
await check('20 known foreign UUID through POST search',async()=>{const r=await ok('/rest/v1/rpc/search_records','POST',{section:'customers',term:'Beta'},'A');assert.equal(r.count,0);});
for(const who of ['A','B','PENDING'])await request('/auth/v1/logout?scope=global','POST',undefined,who);
console.log(JSON.stringify({passed,failed,fixtures:'Synthetic fixtures intentionally retained; dispose of the test project after review.'}));
if(failed)process.exitCode=1;
