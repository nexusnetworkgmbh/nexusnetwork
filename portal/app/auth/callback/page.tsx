'use client';
import {useEffect,useState} from 'react';
import {supabase,configured} from '@/lib/supabase';
import {safeNext} from '@/lib/validation';
import {staticHref} from '@/lib/navigation';
let exchange: Promise<string> | undefined;
async function complete() {
 const url=new URL(window.location.href);
 const code=url.searchParams.get('code'), hash=url.searchParams.get('token_hash'), type=url.searchParams.get('type');
 const next=type==='recovery'?'/reset-password':safeNext(url.searchParams.get('next'));
 // Clear sensitive URL parameters before any asynchronous work or rendering.
 window.history.replaceState(null,'','/auth/callback/');
 if(!configured()) return '/login?notice=setup';
 if(url.searchParams.has('error')) return '/login?notice=expired';
 const db=supabase();
 const result=code?await db.auth.exchangeCodeForSession(code):hash&&['signup','recovery','email_change'].includes(type??'')?await db.auth.verifyOtp({token_hash:hash,type:type as 'signup'|'recovery'|'email_change'}):null;
 if(!result||result.error||!result.data.session) return '/login?notice=expired';
 return next;
}
export default function Callback(){
 const [failed,setFailed]=useState(false);
 useEffect(()=>{let active=true;exchange??=complete();exchange.then(path=>{if(active)window.location.replace(staticHref(path));}).catch(()=>{if(active)setFailed(true);});return()=>{active=false;};},[]);
 return <main id="content" className="error-page"><h1>{failed?'Link nicht verfügbar':'Anmeldung wird bestätigt …'}</h1>{failed&&<p>Bitte einen neuen Link anfordern. <a href="/login/">Zur Anmeldung</a></p>}</main>;
}
