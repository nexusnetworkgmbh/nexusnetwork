import fs from 'node:fs';
import path from 'node:path';
const out=path.resolve('out');
if(!fs.existsSync(path.join(out,'index.html')))throw new Error('Build /out first.');
let files=0;const findings=[];
const patterns=[
 /sb_secret_[A-Za-z0-9_-]+/,
 /service_role|SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|SMTP_PASSWORD|GOOGLE_CLIENT_SECRET|CLIENT_SECRET|JWT_SECRET|POSTGRES_PASSWORD|DATABASE_URL/,
 /-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/,
 /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|GOCSPX-[A-Za-z0-9_-]{20,})\b/,
 /\beyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
 /postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@/,
];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);
 if(entry.isSymbolicLink())throw new Error('Symlink in static output');
 if(entry.isDirectory()){walk(file);continue;}
 files++;
 const bytes=fs.readFileSync(file);if(bytes.includes(0))continue;
 const content=bytes.toString('utf8');
 for(let i=0;i<patterns.length;i++)if(patterns[i].test(content))findings.push({file:path.relative(out,file),rule:i});
 if(entry.name.endsWith('.html')&&(!content.includes('http-equiv="Content-Security-Policy"')||content.includes("script-src 'unsafe-inline'")||content.includes("'unsafe-eval'")))findings.push({file:path.relative(out,file),rule:'csp'});
}}
walk(out);
console.log(JSON.stringify({staticFiles:files,findings},null,2));
if(findings.length)process.exitCode=1;
