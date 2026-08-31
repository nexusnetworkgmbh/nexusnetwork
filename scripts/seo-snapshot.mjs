import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(process.argv[2]||'out');
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
export function snapshot(dir=root){
 const routes=['/','/finanzberater-anbindung/','/finanzanlagenvermittler/','/impressum/','/datenschutz/','/ratgeber/'];
 const pages=routes.map(route=>{
  const html=fs.readFileSync(path.join(dir,route,'index.html'),'utf8');
  const meta=name=>decode(html.match(new RegExp(`<meta name="${name}" content="([^"]*)"`))?.[1]||'');
  return {route,title:decode(html.match(/<title>(.*?)<\/title>/)?.[1]||''),description:meta('description'),h1:decode((html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]||'').replace(/<[^>]+>/g,'')),canonical:html.match(/<link rel="canonical" href="([^"]*)"/)?.[1],robots:meta('robots'),jsonLd:[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1])),links:[...html.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map(m=>decode(m[1]))};
 });
 const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
 const files=walk(dir);
 return {pages,indexablePages:pages.filter(p=>!p.robots.includes('noindex')).length,robots:fs.readFileSync(path.join(dir,'robots.txt'),'utf8'),sitemap:fs.readFileSync(path.join(dir,'sitemap.xml'),'utf8'),artifact:{files:files.length,bytes:files.reduce((n,f)=>n+fs.statSync(f).size,0),javascriptBytes:files.filter(f=>f.endsWith('.js')).reduce((n,f)=>n+fs.statSync(f).size,0)}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(snapshot(),null,2));
