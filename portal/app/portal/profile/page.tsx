'use client';
import {browserPage} from '@/components/browser-page';
import {account} from '@/lib/access';
import {saveProfile} from '@/lib/actions';
import {Heading,FieldInput} from '@/components/ui';
import {ActionForm} from '@/components/action-form';
async function load(){const {db,profile,user}=await account();const {data:partner,error}=await db.from('partner_profiles').select('*').eq('user_id',user.id).single();if(error)throw new Error('Profil konnte nicht geladen werden.');return <><Heading title="Ihr Profil" description="Persönlich erreichbar. Professionell verbunden."/><section className="panel"><ActionForm action={saveProfile}><div className="form-grid"><FieldInput field={{name:'first_name',label:'Vorname',required:true,max:100}} value={profile.first_name}/><FieldInput field={{name:'last_name',label:'Nachname',required:true,max:100}} value={profile.last_name}/><FieldInput field={{name:'phone',label:'Telefon',max:50}} value={profile.phone}/></div></ActionForm></section><section className="panel"><h2>Geschäftliche Angaben</h2><p>{partner.company_name}</p><p>{partner.street} {partner.house_number}<br/>{partner.postal_code} {partner.city}<br/>{partner.country}</p><p>{partner.professional_title}</p><p className="muted">Diese Angaben wurden zur Partnerprüfung eingereicht. Änderungen erfolgen in Release 1 über Ihren Ansprechpartner, nicht durch Selbstfreigabe.</p></section></>;}
export default browserPage(load);
