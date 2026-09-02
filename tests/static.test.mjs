import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {snapshot} from '../scripts/seo-snapshot.mjs';
const root=path.resolve('out');
const before=JSON.parse(fs.readFileSync(new URL('./fixtures/seo-before.json',import.meta.url),'utf8'));
const after=snapshot(root);
const read=route=>fs.readFileSync(path.join(root,route,'index.html'),'utf8');
for(const page of after.pages){
 test('SEO preserved and canonical corrected: '+page.route,()=>{
  const previous=before.pages.find(p=>p.route===page.route);
  for(const key of ['title','description','h1','robots'])assert.equal(page[key],previous[key],key);
  assert.equal(page.canonical,'https://nexusnetwork.pro'+page.route);
  assert.equal([...read(page.route).matchAll(/<h1[\s>]/g)].length,1);
  assert(page.jsonLd.length);for(const schema of page.jsonLd){assert.equal(schema['@type'],'Organization');assert.equal(schema.email,'hello@nexusnetwork.pro');assert(!JSON.stringify(schema).includes('[STRASSE'));assert(!schema.telephone);}
 });
 test('links/assets/CSP: '+page.route,()=>{
  const html=read(page.route);
  assert(!/\/(?:login|register|portal|admin|auth|forgot-password|reset-password)(?:\/|")/i.test(html));
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
   const href=match[1].replaceAll('&amp;','&');if(/^(mailto:|https?:|data:)/.test(href))continue;
   const url=new URL(href,'https://nexusnetwork.pro'+page.route);
   const target=path.join(root,decodeURIComponent(url.pathname));
   assert(fs.existsSync(target),'Missing '+href);
   if(url.hash){const targetHtml=fs.readFileSync(path.join(target,'index.html'),'utf8');assert(targetHtml.includes('id="'+url.hash.slice(1)+'"'),'Missing anchor '+href);}
  }
  const policy=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
  assert(policy&&!policy.includes("'unsafe-eval'"));assert(policy.includes("connect-src 'self';"));
  for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!script[1].includes('src=')&&script[2])assert(policy.includes('sha256-'+createHash('sha256').update(script[2]).digest('base64')));
  for(const image of html.matchAll(/<img\b[^>]*>/g)){assert(/\balt="/.test(image[0]));assert(/\bwidth="/.test(image[0])&&/\bheight="/.test(image[0]));}
 });
}
test('no removed route or second app assets exported',()=>{
 for(const route of ['login','register','forgot-password','reset-password','auth','onboarding','portal','admin','portal-assets'])assert(!fs.existsSync(path.join(root,route)),route);
 const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
 assert.deepEqual(lock.packages[''].workspaces,['site']);
 assert(!Object.keys(lock.packages).some(p=>/supabase|pglite|(?:^|\/)portal$/.test(p)));
});
test('sitemap: six substantive indexable pages and no false build timestamps',()=>{
 assert.equal(after.indexablePages,6);
 const urls=[...after.sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
 assert.deepEqual(urls,after.pages.filter(p=>!p.robots.includes('noindex')).map(p=>p.canonical));
 assert(!after.sitemap.includes('<lastmod>'));assert(after.robots.includes('Allow: /'));assert(after.robots.includes('Sitemap: https://nexusnetwork.pro/sitemap.xml'));
});
test('knowledge hub uses official sources and careful qualification language',()=>{
 const html=read('/ratgeber/');
 for(const id of ['erlaubnis','sachkunde','qualifikationen','register','versicherung','pflichten'])assert(html.includes(`id="${id}"`),id);
 for(const source of ['gesetze-im-internet.de/gewo/__34f.html','gesetze-im-internet.de/finvermv/__4.html','vermittlerregister.info/vermittler','ihk.de/berlin/'])assert(html.includes(source),source);
 assert(html.includes('Nicht jeder Antragsteller muss zwingend dieselbe IHK-Prüfung ablegen.'));
 assert(!html.includes('Wissen im Aufbau'));assert(!html.includes('noindex'));
});
test('current logo, OG and deployment markers',()=>{
 assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,'nexus-brand.png'))).digest('hex'),'3890e72dbf62e03386b0e3567430048cf11989b4c46ae77a6d02fec308d63855');
 assert(fs.existsSync(path.join(root,'og.png')));assert(fs.existsSync(path.join(root,'.nojekyll')));
 assert.equal(fs.readFileSync(path.join(root,'CNAME'),'utf8').trim(),'nexusnetwork.pro');
 const html=read('/');assert(html.includes('property="og:image"'));assert(html.includes('name="twitter:card"'));
});
test('contact CTA, four valid mail links, mobile navigation and no-JS fallback',()=>{
 const html=read('/');
 for(const recipient of ['hello','anbindung','kooperation','frage'])assert(html.includes('mailto:'+recipient+'@nexusnetwork.pro'));
 assert(html.includes('Mobile Hauptnavigation'));assert(html.includes('E-Mail vorbereiten'));assert(html.includes('<noscript>'));assert(html.includes('fieldset disabled'));
});
test('homepage SEO content, images and external links are substantive',()=>{
 const html=read('/');
 const visible=html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ');
 assert(visible.trim().split(/\s+/).length>=800,'homepage should contain at least 800 indexable words');
 for(const image of html.matchAll(/<img\b[^>]*>/g))assert(/\balt="[^"]+"/.test(image[0]),'images need meaningful alt text');
 assert(!/<(?:strong|b)\b[^>]*>NEXUS</i.test(html),'brand name must not misuse emphasis tags');
 for(const link of html.matchAll(/<a\b[^>]*href="https?:\/\/[^\"]+"[^>]*>/g))assert(/rel="[^"]*noopener[^"]*noreferrer[^"]*"/.test(link[0]),'external links need safe rel attributes');
 for(const text of ['NEXUS Finanz GmbH &amp; Co. KG','§ 34f der Gewerbeordnung','LinkedIn','WhatsApp'])assert(html.includes(text),text);
 const withoutHeading=html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i,' ');
 for(const word of ['Verbindung','zwischen','Finanzfachkräften','Möglichkeiten'])assert(new RegExp(`\\b${word}\\b`,'i').test(withoutHeading),`H1 word missing from body: ${word}`);
});
test('custom 404 remains nonindexable and links home',()=>{
 const html=fs.readFileSync(path.join(root,'404.html'),'utf8');assert(html.includes('Diese Verbindung führt ins Leere.'));assert(html.includes('noindex'));assert(html.includes('href="/"'));
});
test('public information, headings and visual design preserved apart from intended contact/navigation changes',()=>{
 const html=read('/');
 for(const text of ['Kennenlernen','Einordnung','Anbindung','Begleitung','Direkte Kommunikation','Professionelle Abläufe','Individuelle Perspektive','Langfristige Ausrichtung','network-canvas','brand-logo-frame'])assert(html.includes(text));
 const network=fs.readFileSync('site/app/network-field.tsx','utf8');
 assert(network.includes("prefers-reduced-motion: reduce"));assert(network.includes("IntersectionObserver"));assert(network.includes("visibilitychange"));assert(network.includes('Math.min(devicePixelRatio||1,1.35)'));
});
