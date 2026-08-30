// Local preview only, NOT an application backend or production dependency.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=fs.realpathSync(path.resolve(process.argv[2]||'out'));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.xml':'application/xml'};
http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){
   if(!url.pathname.endsWith('/')){res.writeHead(301,{Location:url.pathname+'/'+url.search});return res.end();}
   file=path.join(file,'index.html');
  }
  if(!fs.existsSync(file)){res.writeHead(404);return res.end('Not found');}
  if(!fs.realpathSync(file).startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(400);res.end('Bad request');}
}).listen(Number(process.argv[3]||4173),'127.0.0.1',()=>console.log('Static preview ready (loopback only).'));
