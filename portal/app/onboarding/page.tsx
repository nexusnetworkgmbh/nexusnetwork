'use client';
import {browserPage} from '@/components/browser-page';
import {account} from '@/lib/access';
import {redirect} from '@/lib/navigation';
import {logout} from '@/lib/actions';
import {type PartnerProfile} from '@/lib/domain';
import {OnboardingForm} from '@/components/onboarding-form';
import {Brand,Badge,Heading} from '@/components/ui';
async function load(){
 const {db,user,profile}=await account();if(profile.status==='active') redirect('/portal');
 const {data,error}=await db.from('partner_profiles').select('*').eq('user_id',user.id).single();if(error)throw new Error('Partnerprofil konnte nicht geladen werden.');
 const partner=data as PartnerProfile;const values={...partner,...profile} as unknown as Record<string,string>;
 const contact=Boolean(profile.first_name&&profile.last_name);const company=Boolean(partner.company_name&&partner.street&&partner.house_number&&partner.postal_code&&partner.city&&partner.country);const work=Boolean(partner.professional_title);
 return <main id="content" className="onboarding"><div className="inline"><Brand/><form action={logout}><button>Abmelden</button></form></div><Heading eyebrow="IHRE PARTNERSCHAFT" title="Willkommen bei Nexus Network." description="Ein paar Angaben. Eine persönliche Prüfung. Eine tragfähige Verbindung."/><ol className="progress">{[['Account',true],['Kontaktdaten',contact],['Unternehmen',company],['Berufliche Angaben',work],['Antrag einreichen',Boolean(partner.submitted_at)]].map(([label,done])=><li key={String(label)} className={done?'done':''}>{done?'✓':'○'} {label}</li>)}</ol><Badge value={profile.status}/>
 {profile.status==='pending'?<section className="panel"><h2>Ihre Angaben</h2><p className="muted">E-Mail: {user.email}. Die beruflichen Angaben dienen ausschließlich der manuellen Prüfung; sie bestätigen keine regulatorische Berechtigung.</p><OnboardingForm values={values} privacyUrl={'/datenschutz/'}/></section>:<section className="panel status-panel"><h2>{profile.status==='under_review'?'Ihre Angaben werden derzeit von Nexus Network geprüft.':profile.status==='suspended'?'Ihr Zugang ist vorübergehend eingeschränkt.':'Ihr Antrag wurde nicht freigegeben.'}</h2><p className="muted">Bei Fragen wenden Sie sich bitte an Ihren Ansprechpartner. Geschäftsdaten sind bis zur Freigabe nicht zugänglich.</p></section>}</main>;
}
export default browserPage(load);
