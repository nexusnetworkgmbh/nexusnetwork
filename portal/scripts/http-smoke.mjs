import assert from 'node:assert/strict';
const base=process.env.TEST_APP_URL??'http://127.0.0.1:3001';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Smoke tests target local development only.');
for(const path of ['/login','/register','/forgot-password']){
 const response=await fetch(base+path);assert.equal(response.status,200,path);
 assert.match(response.headers.get('cache-control')??'',/no-store/);
 assert.equal(response.headers.get('x-frame-options'),'DENY');
 const html=await response.text();assert(html.includes('Nexus Network'));
 console.log(`PASS ${path}: 200, no-store, DENY`);
}
for(const path of ['/portal','/portal/customers','/portal/deals','/portal/tasks','/portal/profile','/portal/settings','/onboarding','/admin','/reset-password']){
 const response=await fetch(base+path,{redirect:'manual'});
 assert([303,307].includes(response.status),`${path}: must redirect, got ${response.status}`);
 assert(response.headers.get('location')?.startsWith('/login'));
 console.log(`PASS ${path}: unauthenticated access denied`);
}
const callback=await fetch(base+'/auth/callback',{redirect:'manual'});assert([303,307].includes(callback.status));
console.log('PASS auth callback without credentials/code fails closed');
