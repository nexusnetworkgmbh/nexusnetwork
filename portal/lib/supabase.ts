import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export function configured() { return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY); }
export function appUrl() { const url=process.env.NEXT_PUBLIC_APP_URL; if(!url) throw new Error('NEXT_PUBLIC_APP_URL fehlt.'); const parsed=new URL(url); if(parsed.protocol!=='https:' && !(parsed.protocol==='http:'&&['localhost','127.0.0.1'].includes(parsed.hostname))) throw new Error('HTTPS erforderlich.'); return parsed.origin; }
export async function supabase() {
  if(!configured()) throw new Error('Supabase ist noch nicht konfiguriert.');
  const jar=await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{
    cookieOptions:{sameSite:'lax',secure:process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://'),httpOnly:true},
    cookies:{getAll(){return jar.getAll();},setAll(values){try{values.forEach(({name,value,options})=>jar.set(name,value,options));}catch{/* Server Components: refresh handled by proxy. */}}},
  });
}
