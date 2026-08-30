// Opt-in integration test, ONLY against a disposable local Supabase instance.
// Does not claim to test email delivery or third-party OAuth.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,secret=process.env.SUPABASE_SECRET_KEY;
if(!url||!key||!secret)throw new Error('Local Supabase URL, publishable key and secret key required. No integration tests executed.');
if(!['localhost','127.0.0.1'].includes(new URL(url).hostname)||process.env.ALLOW_LOCAL_AUTH_TEST!=='yes')throw new Error('Only disposable local Supabase is allowed. Set ALLOW_LOCAL_AUTH_TEST=yes.');
const options={auth:{persistSession:false,autoRefreshToken:false}};
const operator=createClient(url,secret,options),partner=createClient(url,key,options),other=createClient(url,key,options);
const email=`nexus-test-${randomUUID()}@example.invalid`,password=`Test-${randomUUID()}!`;
const signup=await partner.auth.signUp({email,password,options:{data:{first_name:'Fiktiv',last_name:'Integration',role:'super_admin',status:'active'}}});
assert.ifError(signup.error);assert(signup.data.user);assert.equal(signup.data.session,null,'Confirm email must be enabled');const uid=signup.data.user.id;
assert((await partner.auth.signInWithPassword({email,password})).error,'Unverified login must fail');
// Explicit operator confirmation tests the verification gate, not a mailed link.
assert.ifError((await operator.auth.admin.updateUserById(uid,{email_confirm:true})).error);
assert((await partner.auth.signInWithPassword({email,password:'wrong-password'})).error);
assert.ifError((await partner.auth.signInWithPassword({email,password})).error);
let profile=await partner.from('profiles').select('role,status').eq('user_id',uid).single();assert.ifError(profile.error);assert.deepEqual(profile.data,{role:'partner',status:'pending'});
assert((await partner.from('profiles').update({status:'active'}).eq('user_id',uid)).error);
assert((await partner.from('profiles').update({role:'super_admin'}).eq('user_id',uid)).error);
const application={first_name:'Fiktiv',last_name:'Integration',company_name:'Fiktive Testfirma',street:'Testweg',house_number:'1',postal_code:'12345',city:'Testort',country:'Deutschland',professional_title:'Testtätigkeit',consent:'yes'};
assert.ifError((await partner.rpc('save_onboarding',{payload:application,submit:true})).error);
profile=await partner.from('profiles').select('status').eq('user_id',uid).single();assert.equal(profile.data.status,'under_review');
// Provision one internal reviewer via operator credentials, never via user metadata.
const reviewerEmail=`reviewer-${randomUUID()}@example.invalid`;
const reviewerUser=await operator.auth.admin.createUser({email:reviewerEmail,password,email_confirm:true});assert.ifError(reviewerUser.error);const reviewerId=reviewerUser.data.user.id;
assert.ifError((await operator.from('profiles').update({role:'admin',status:'active'}).eq('user_id',reviewerId)).error);
assert.ifError((await other.auth.signInWithPassword({email:reviewerEmail,password})).error);
assert.ifError((await other.rpc('review_partner',{target:uid,new_status:'active'})).error);
const membership=await partner.from('organization_members').select('organization_id').eq('user_id',uid).single();assert.ifError(membership.error);const org=membership.data.organization_id;
const customer=await partner.from('customers').insert({organization_id:org,first_name:'Fiktiv',last_name:'Kunde'}).select('id').single();assert.ifError(customer.error);
assert.equal((await other.from('customers').select('id').eq('id',customer.data.id)).data.length,0,'Admin must not automatically see foreign business data');
assert.ifError((await other.rpc('review_partner',{target:uid,new_status:'suspended'})).error);
assert.equal((await partner.from('customers').select('id')).data.length,0);
assert.ifError((await other.rpc('review_partner',{target:uid,new_status:'active'})).error);
const session=await partner.auth.getSession();const previousToken=session.data.session.access_token;
assert.ifError((await partner.auth.signOut({scope:'global'})).error);
const replay=createClient(url,key,{...options,global:{headers:{Authorization:`Bearer ${previousToken}`}}});
const replayResult=await replay.from('customers').select('id');assert(replayResult.error||replayResult.data.length===0,'Revoked session token must not access rows');
assert.ifError((await other.auth.signOut({scope:'global'})).error);
console.log('PASS: signup gate, invalid password, login, metadata/role/status isolation, onboarding, admin approval, tenant isolation, suspension, logout/token replay.');
console.log('Fictional fixtures remain in the disposable LOCAL database; no production database was used. Email links, SMTP delivery, OAuth and browser flows remain separate acceptance tests.');
