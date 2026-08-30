import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=process.cwd();
const mode=process.argv[2]??'worktree';
const findings=[];let checked=0;let keywordFiles=0;let reviewedExamples=0;
const allowlist=JSON.parse(fs.readFileSync(new URL('./security-audit-allowlist.json',import.meta.url),'utf8'));
const patterns=[
 ['private-key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/],
 ['Supabase-key',/\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{16,}\b/],
 ['JWT',/\beyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/],
 ['GitHub-token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/],
 ['API-token',/\b(?:sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_-]{30,}|GOCSPX-[A-Za-z0-9_-]{20,}|AKIA[A-Z0-9]{16})\b/],
 ['credential-in-URL',/\b(?:https?|postgres(?:ql)?):\/\/[^\s/:'"<>]+:[^\s/@'"<>]+@/],
 ['credential-assignment',/\b(?:SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|GOOGLE_CLIENT_SECRET|CLIENT_SECRET|SMTP_PASSWORD|PRIVATE_KEY|PASSWORD|API_KEY|SECRET)\s*[:=]\s*["'][^"'\r\n]{8,}["']/i],
 ];
const keywords=/SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|service_role|GOOGLE_CLIENT_SECRET|CLIENT_SECRET|SMTP_PASSWORD|PRIVATE_KEY|DATABASE_URL|POSTGRES_PASSWORD|JWT_SECRET|Bearer|Authorization|password|api_key|secret/i;
function scan(label,bytes){
 if(bytes.includes(0))return;const content=bytes.toString('utf8');checked++;
 if(keywords.test(content))keywordFiles++;
 content.split(/\r?\n/).forEach((line,i)=>{for(const [kind,pattern] of patterns)if(pattern.test(line)){
 const hash=createHash('sha256').update(line).digest('hex');
 if(allowlist.some(entry=>entry.file===label&&entry.kind===kind&&entry.lineSHA256===hash))reviewedExamples++;
 else findings.push({file:label,line:i+1,kind});
 }});
 if(path.basename(label)==='.env.example')content.split(/\r?\n/).forEach((line,i)=>{if(/^\s*[A-Z][A-Z0-9_]*\s*=\s*\S/.test(line))findings.push({file:label,line:i+1,kind:'nonempty-env-example'});});
}
function git(args,location=root){return execFileSync('git',['-c',`safe.directory=${location.replaceAll('\\','/')}`,'-C',location,...args],{maxBuffer:64*1024*1024});}
const skipDirs=new Set(['.git','.local-history','node_modules','.next','.pnpm-store','.cache','.turbo','out','dist','build','output','outputs','coverage','test-results','.wrangler','.vercel']);
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isSymbolicLink())continue;if(entry.isDirectory()){if(!skipDirs.has(entry.name))walk(file);}else if(entry.isFile())scan(path.relative(root,file).replaceAll('\\','/'),fs.readFileSync(file));}}
if(mode==='worktree')walk(root);
else if(mode==='staged'){
 const names=git(['diff','--cached','--name-only','--diff-filter=ACMR','-z']).toString().split('\0').filter(Boolean);
 for(const name of names){
 if(/(^|\/)(node_modules|\.next|out|dist|build|\.pnpm-store|\.local-history|\.vscode|\.idea|\.vercel|\.wrangler|coverage|test-results)(\/|$)|(^|\/)\.env(?!\.example$)|\.(?:pem|key|p8|p12|pfx|crt|db|sqlite3?|log|tsbuildinfo)$|(?:client_secret|credentials).*\.json$/i.test(name))findings.push({file:name,kind:'forbidden-staged-file'});
 scan(name,git(['show',`:${name}`]));
 }
 const entries=git(['ls-files','--stage']).toString().split('\n');for(const entry of entries)if(entry.startsWith('160000 '))findings.push({file:entry.split('\t')[1],kind:'embedded-gitlink'});
 console.log(`Staged files: ${names.length}`);
}else if(mode==='history'){
 const location=path.resolve(process.argv[3]??root);
 const objects=git(['rev-list','--objects','--all'],location).toString().trim().split('\n').filter(Boolean);
 for(const item of objects){const space=item.indexOf(' ');const hash=space<0?item:item.slice(0,space);const label=space<0?hash:item.slice(space+1);if(git(['cat-file','-t',hash],location).toString().trim()==='blob')scan(`history:${label}`,git(['cat-file','blob',hash],location));}
}else throw new Error('Use worktree, staged, or history [repository]');
console.log(JSON.stringify({mode,textFilesScanned:checked,filesContainingCredentialKeywords:keywordFiles,reviewedNonSecretExamples:reviewedExamples,potentialSecrets:findings.length,findings},null,2));
if(findings.length)process.exitCode=1;
