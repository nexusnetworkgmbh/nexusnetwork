'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { configured, supabase } from '@/lib/supabase';
import {account,activeAccount,admin} from '@/lib/access';
type Input = {params: Promise<Record<string,string>>; searchParams: Promise<Record<string,string>>; children?: ReactNode};
// Runs only after hydration, never at build time. Data stays in ephemeral React state.
export function browserPage(load: (input: Input) => Promise<ReactNode>, fixed: Record<string,string> = {}) {
 return function BrowserPage({children}: {children?: ReactNode}) {
  const [state, setState] = useState<{view?: ReactNode; error?: boolean}>({});
  const [revision, setRevision] = useState(0);
  useEffect(() => {
   let alive = true;
   const refresh = () => { setState({}); setRevision(value => value+1); };
   const checkAccess = async () => {
    try {
     const path=window.location.pathname;
     if(path.startsWith('/admin/'))await admin();
     else if(path.startsWith('/portal/'))await activeAccount();
     else if(path.startsWith('/onboarding/'))await account();
    } catch { if(alive)setState({error:true}); }
   };
   const onVisible = () => { if(document.visibilityState === 'visible') void checkAccess(); };
   const hide = () => setState({});
   const restore = (event: PageTransitionEvent) => { if(event.persisted)refresh(); };
   const query = Object.fromEntries(new URLSearchParams(window.location.search));
   load({params: Promise.resolve({...fixed,id:query.id??''}), searchParams: Promise.resolve(query), children})
    .then(view => { if(alive) setState({view}); })
    .catch(() => { if(alive) setState({error:true}); });
   window.addEventListener('nexus:refresh',refresh);
   window.addEventListener('pagehide',hide);
   window.addEventListener('pageshow',restore);
   document.addEventListener('visibilitychange',onVisible);
   const interval = window.setInterval(checkAccess, 60000);
   const subscription = configured() ? supabase().auth.onAuthStateChange(event => {
    if(event === 'SIGNED_OUT') { setState({}); window.location.replace('/login/'); }
   }).data.subscription : undefined;
   return () => { alive=false; clearInterval(interval); subscription?.unsubscribe(); window.removeEventListener('nexus:refresh',refresh); window.removeEventListener('pagehide',hide); window.removeEventListener('pageshow',restore); document.removeEventListener('visibilitychange',onVisible); };
  }, [children, revision]);
  if(state.error) return <section className="error-page" role="alert"><h1>Bereich nicht verfügbar</h1><p>Die Berechtigung oder Verbindung konnte nicht bestätigt werden. Es werden keine Daten angezeigt.</p><button onClick={() => {setState({});setRevision(value=>value+1);}}>Erneut versuchen</button><p><a href="/login/">Zur Anmeldung</a></p></section>;
  return state.view ?? <section className="error-page" aria-busy="true"><p role="status">Zugang wird geprüft …</p><div className="skeleton"/></section>;
 };
}
