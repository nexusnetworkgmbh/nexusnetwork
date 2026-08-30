import Link from 'next/link';
import {authenticate,oauth} from '@/lib/actions';
import {configured} from '@/lib/supabase';
import {ActionForm} from './action-form';
const titles:Record<string,string>={'login':'Willkommen zurück','register':'Gemeinsam weiterkommen','forgot-password':'Passwort vergessen?','reset-password':'Ein neuer, sicherer Start'};
const notices:Record<string,string>={setup:'Die Supabase-Verbindung ist noch nicht eingerichtet. Zugang ist erst nach der Einrichtung möglich.',verify:'Bitte zuerst Ihre E-Mail-Adresse bestätigen.',password:'Ihr Passwort wurde geändert. Bitte erneut anmelden.',provider:'Dieser Anmeldedienst ist noch nicht eingerichtet oder derzeit nicht erreichbar.',expired:'Der Bestätigungslink ist ungültig oder abgelaufen. Bitte einen neuen Link anfordern.'};
export function AuthPage({mode,notice}:{mode:string;notice?:string}){
 const ready=configured();const login=mode==='login',register=mode==='register';
 return <><p className="eyebrow">IHR PARTNERZUGANG</p><h2>{titles[mode]}</h2><p className="muted">{register?'Erstellen Sie Ihr Konto. Nach Bestätigung Ihrer E-Mail führen wir Sie durch die Partneranmeldung.':login?'Melden Sie sich in Ihrem geschützten Arbeitsbereich an.':'Wir helfen Ihnen, wieder sicher auf Ihr Konto zuzugreifen.'}</p>
 {(!ready||notice)&&<p className="alert" role="status">{!ready?notices.setup:notices[notice??'']}</p>}
 {(login||register)&&<div className="oauth">{(['google','apple'] as const).map(provider=>{const enabled=ready&&(provider==='google'?process.env.AUTH_GOOGLE_ENABLED:process.env.AUTH_APPLE_ENABLED)==='true';return <form key={provider} action={oauth.bind(null,provider)}><button disabled={!enabled} className="oauth-button">Mit {provider==='google'?'Google':'Apple'} fortfahren{!enabled?' · noch nicht eingerichtet':''}</button></form>;})}<div className="separator">oder mit E-Mail</div></div>}
 <ActionForm action={authenticate.bind(null,mode)} disabled={!ready} label={login?'Anmelden →':register?'Konto erstellen →':mode==='forgot-password'?'Link anfordern':'Passwort speichern'}>
 {register&&<div className="form-grid"><label>Vorname<input name="first_name" autoComplete="given-name" maxLength={100} required/></label><label>Nachname<input name="last_name" autoComplete="family-name" maxLength={100} required/></label></div>}
 {mode!=='reset-password'&&<label>E-Mail<input type="email" name="email" autoComplete="email" required maxLength={254}/></label>}
 {mode!=='forgot-password'&&<label>Passwort<input type="password" name="password" autoComplete={login?'current-password':'new-password'} required minLength={login?1:12} maxLength={128}/>{!login&&<small>Mindestens 12 Zeichen.</small>}</label>}
 {register&&<label className="check"><input type="checkbox" name="consent" required/><span>Ich habe die <a href={`${process.env.NEXT_PUBLIC_WEBSITE_URL??'http://localhost:4173'}/datenschutz/`}>Datenschutzhinweise</a> gelesen.</span></label>}
 </ActionForm>
 <div className="auth-links">{login?<><Link href="/forgot-password">Passwort vergessen?</Link><span>Noch kein Konto? <Link href="/register">Registrieren</Link></span></>:<Link href="/login">Zur Anmeldung</Link>}</div></>;
}
