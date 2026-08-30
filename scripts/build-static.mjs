import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {parseEnv} from 'node:util';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'out');
const allowed=['NEXT_PUBLIC_APP_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];
for(const name of ['.env','.env.local']){
 const file=path.join(root,name);
 if(fs.existsSync(file)){
  for(const [key,value] of Object.entries(parseEnv(fs.readFileSync(file,'utf8')))){
   if(!allowed.includes(key))throw new Error('Root build environment contains an unsupported variable name: '+key);
   if(!process.env[key])process.env[key]=value;
  }
 }
}
const app=process.env.NEXT_PUBLIC_APP_URL||'https://nexusnetwork.pro';
const appURL=new URL(app);
if(appURL.origin!==app.replace(/\/$/,''))throw new Error('APP_URL must be an origin, without a path.');
if(appURL.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(appURL.hostname))throw new Error('HTTPS required.');
const api=process.env.NEXT_PUBLIC_SUPABASE_URL||'',key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'';
if(Boolean(api)!==Boolean(key))throw new Error('Supply both public Supabase values, or neither for an unconfigured preview.');
if(key&&!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))throw new Error('Only a publishable Supabase key is accepted.');
let apiOrigin='';
if(api){const url=new URL(api);if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw new Error('Supabase HTTPS required.');apiOrigin=url.origin;}
if(!api)console.log('Unconfigured preview: auth and business access fail closed.');
// Only public application values enter build processes. No service/database/provider credentials.
const env={};
for(const [name,value] of Object.entries(process.env))if(/^(PATH|PATHEXT|SYSTEMROOT|WINDIR|TEMP|TMP|COMSPEC|HOME|USERPROFILE|LOCALAPPDATA|APPDATA|CI|NUMBER_OF_PROCESSORS)$/i.test(name))env[name]=value;
Object.assign(env,{NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',NEXT_PUBLIC_APP_URL:app,NEXT_PUBLIC_SUPABASE_URL:api,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:key});
for(const name of ['site','portal']){
 const cwd=path.join(root,name),require=createRequire(path.join(cwd,'package.json'));
 const run=spawnSync(process.execPath,[require.resolve('next/dist/bin/next'),'build'],{cwd,env,stdio:'inherit'});
 if(run.status!==0)process.exit(run.status||1);
}
// Only recreate the generated output directory, never a source directory.
if(path.dirname(out)!==root||path.basename(out)!=='out')throw new Error('Unsafe output path');
fs.rmSync(out,{recursive:true,force:true});
fs.cpSync(path.join(root,'site/out'),out,{recursive:true});
for(const name of ['login','register','forgot-password','reset-password','auth','onboarding','portal','admin']){
 fs.cpSync(path.join(root,'portal/out',name),path.join(out,name),{recursive:true,errorOnExist:true});
}
fs.cpSync(path.join(root,'portal/out/_next'),path.join(out,'portal-assets/_next'),{recursive:true});
fs.writeFileSync(path.join(out,'CNAME'),'nexusnetwork.pro\n');
fs.writeFileSync(path.join(out,'.nojekyll'),'');
function harden(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){harden(file);continue;}
  if(!entry.name.endsWith('.html'))continue;
  let html=fs.readFileSync(file,'utf8');
  const hashes=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>!(/\bsrc\s*=/i.test(m[1]))&&m[2]).map(m=>"'sha256-"+createHash('sha256').update(m[2]).digest('base64')+"'");
  const policy=["default-src 'none'","script-src 'self' "+[...new Set(hashes)].join(' '),"style-src 'self' 'unsafe-inline'","img-src 'self' data:","font-src 'self'","connect-src 'self'"+(apiOrigin?' '+apiOrigin:''),"base-uri 'none'","object-src 'none'","form-action 'self'","frame-src 'none'","worker-src 'none'","manifest-src 'self'"].join('; ');
  const meta='<meta http-equiv="Content-Security-Policy" content="'+policy.replaceAll('"','&quot;')+'"><meta name="referrer" content="no-referrer">';
  html=html.replace('<head>','<head>'+meta);
  fs.writeFileSync(file,html);
 }
}
harden(out);
const audit=spawnSync(process.execPath,[path.join(root,'scripts/audit-static.mjs')],{cwd:root,stdio:'inherit'});
if(audit.status!==0)process.exit(audit.status||1);
console.log('Static site + portal generated in /out. Nothing deployed.');
