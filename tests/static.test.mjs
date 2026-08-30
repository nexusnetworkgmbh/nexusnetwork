import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve('out');
const routes=['/','/login/','/register/','/forgot-password/','/reset-password/','/auth/callback/','/onboarding/','/portal/','/portal/customers/','/portal/deals/','/portal/tasks/','/portal/profile/','/portal/settings/','/admin/','/admin/partner/','/impressum/','/datenschutz/'];
for(const section of ['customers','deals','tasks'])for(const action of ['new','detail','edit'])routes.push('/portal/'+section+'/'+action+'/');
for(const route of routes)test('static document and assets: '+route,()=>{
 const html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
 assert(html.includes('<html'),'HTML document');
 assert(!html.includes('/nexusnetwork/_next/'),'No repository basePath');
 for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const href=match[1].split('?')[0];
  if(href.startsWith('/_next/')||href.startsWith('/portal-assets/_next/'))assert(fs.existsSync(path.join(root,href)),href);
 }
 const meta=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
 assert(meta&&!meta.includes("'unsafe-eval'"),'CSP');
 for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!script[1].includes('src=')&&script[2])assert(meta.includes('sha256-'+createHash('sha256').update(script[2]).digest('base64')),'Inline script is hash-authorized');
});
test('custom domain and Pages marker',()=>{assert.equal(fs.readFileSync(path.join(root,'CNAME'),'utf8').trim(),'nexusnetwork.pro');assert(fs.existsSync(path.join(root,'.nojekyll')));});
test('protected routes export only neutral placeholders',()=>{for(const route of routes.filter(r=>r.startsWith('/portal/')||r.startsWith('/admin/')||r==='/onboarding/')){const html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');assert(html.includes('Zugang wird geprüft'));assert(!html.includes('Fiktiv'));assert(!html.includes('Testvermittlung'));}});
