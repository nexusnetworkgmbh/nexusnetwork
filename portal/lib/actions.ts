'use client';
import { redirect } from '@/lib/navigation';
import { revalidatePath } from '@/lib/navigation';
import { account, activeAccount, admin, tenant } from './access';
import { supabase, configured, appUrl } from './supabase';
import { googleOAuthEnabled } from './features';
import { amount, choice, date, email, optionalId, password, loginPassword, text, uuid, ValidationError } from './validation';
import { dealStatuses, taskStatuses, priorities } from './domain';
import { isSection, onboardingFields, sections, type Section } from './fields';
export type ActionState={error?:string;success?:string};
function fail(error:unknown):ActionState { return {error:error instanceof ValidationError?error.message:'Die Aktion konnte nicht gespeichert werden. Bitte Eingaben prüfen und erneut versuchen.'}; }
function check(error:unknown){if(error) throw new Error('Database operation failed');}
export async function authenticate(mode:string,_state:ActionState,data:FormData):Promise<ActionState> {
  if(!configured()) return {error:'Der Betreiber muss zuerst die Supabase-Verbindung einrichten.'};
  let destination='/portal';
  try {
    const db=await supabase();
    if(mode==='login') {
      const pass=loginPassword(data);
      const result=await db.auth.signInWithPassword({email:email(data),password:pass});
      if(result.error) return {error:'Anmeldung nicht möglich. Bitte Zugangsdaten und E-Mail-Bestätigung prüfen.'};
    } else if(mode==='register') {
      if(data.get('consent')!=='on') throw new ValidationError('Bitte die Datenschutzhinweise bestätigen.');
      const result=await db.auth.signUp({email:email(data),password:password(data),options:{emailRedirectTo:`${appUrl()}/auth/callback`,data:{first_name:text(data,'first_name',100),last_name:text(data,'last_name',100)}}});
      if(result.error) return {error:'Registrierung momentan nicht möglich. Bitte Eingaben prüfen oder später erneut versuchen.'};
      if(result.data.session) await db.auth.signOut();
      return {success:'Bitte bestätigen Sie Ihre E-Mail über den zugesandten Link. Falls bereits ein Konto besteht, nutzen Sie die Anmeldung oder Passwort vergessen.'};
    } else if(mode==='forgot-password') {
      await db.auth.resetPasswordForEmail(email(data),{redirectTo:`${appUrl()}/auth/callback?next=/reset-password`});
      return {success:'Falls ein Konto zu dieser E-Mail existiert, erhalten Sie einen Link zum Zurücksetzen.'};
    } else if(mode==='reset-password') {
      const {data:{user}}=await db.auth.getUser();
      if(!user) return {error:'Der Link ist abgelaufen. Bitte einen neuen Link anfordern.'};
      const result=await db.auth.updateUser({password:password(data)});check(result.error);
      const logoutResult=await db.auth.signOut({scope:'global'});check(logoutResult.error);destination='/login?notice=password';
    } else throw new ValidationError('Ungültige Aktion.');
  } catch(error){return fail(error);}
  redirect(destination);
}
export async function oauth() {
  if(!configured() || !googleOAuthEnabled) redirect('/login?notice=provider');
  const db=await supabase();
  const {error}=await db.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${appUrl()}/auth/callback/`}});
  if(error) redirect('/login?notice=provider');
}
export async function logout() {
  const db=await supabase();const {error}=await db.auth.signOut({scope:'global'});
  if(error) throw new Error('Abmeldung nicht möglich. Bitte erneut versuchen.');
  redirect('/login');
}
export async function saveRecord(section:Section,id:string|null,_state:ActionState,data:FormData):Promise<ActionState> {
  const {db,user,organizationId}=await tenant();
  let savedId=id;
  try {
    if(!isSection(section)) throw new ValidationError('Ungültiger Bereich.');
    if(id) uuid(id);
    // Deliberately ignore organization_id, created_by and every unlisted field.
    const payload:Record<string,string|number|null>={};
    for(const field of sections[section].fields){
      if(['customer','deal','member'].includes(field.type??'')) payload[field.name]=optionalId(data,field.name);
      else if(field.name==='email') payload.email=email(data,false)||null;
      else if(field.name==='investment_amount') payload.investment_amount=amount(data);
      else if(field.name==='due_date') payload.due_date=date(data,field.name);
      else if(field.options) payload[field.name]=choice(data,field.name,field.options);
      else payload[field.name]=text(data,field.name,field.max??200,field.required??false)||null;
      if(field.required && !payload[field.name]) throw new ValidationError(`Bitte „${field.label}“ ausfüllen.`);
    }
    if(section==='deals') payload.status=choice(data,'status',dealStatuses);
    if(section==='tasks'){payload.status=choice(data,'status',taskStatuses);payload.priority=choice(data,'priority',priorities);}
    const query=id?db.from(section).update(payload).eq('id',id).eq('organization_id',organizationId):db.from(section).insert({...payload,organization_id:organizationId,created_by:user.id});
    const {data:record,error}=await query.select('id').single();check(error);if(!record)throw new Error('Record unavailable');savedId=record.id;
  }catch(error){return fail(error);}
  revalidatePath('/portal','layout');redirect(`/portal/${section}/detail?id=${savedId}`);
}
export async function completeTask(id:string,_state:ActionState,_data:FormData):Promise<ActionState>{
  void _state;void _data;
  const {db,organizationId}=await tenant();
  try {uuid(id);const result=await db.from('tasks').update({status:'completed'}).eq('id',id).eq('organization_id',organizationId).select('id').single();check(result.error);}catch(error){return fail(error);}
  revalidatePath('/portal','layout');return {success:'Aufgabe erledigt.'};
}
export async function addNote(id:string,_state:ActionState,data:FormData):Promise<ActionState>{
  const {db,user,organizationId}=await tenant();
  try {uuid(id);const result=await db.from('deal_notes').insert({organization_id:organizationId,deal_id:id,created_by:user.id,content:text(data,'content',5000)});check(result.error);}catch(error){return fail(error);}
  revalidatePath(`/portal/deals/detail?id=${id}`);return {success:'Notiz gespeichert.'};
}
export async function onboarding(_state:ActionState,data:FormData):Promise<ActionState>{
  const {db}=await account();
  try {
    const submit=data.get('submit')==='yes';const payload:Record<string,string>={};
    for(const field of onboardingFields) payload[field.name]=text(data,field.name,field.max??200,submit&&Boolean(field.required));
    payload.consent=data.get('consent')==='on'?'yes':'no';
    const {error}=await db.rpc('save_onboarding',{payload,submit});check(error);
    revalidatePath('/onboarding');return {success:submit?'Ihr Antrag wurde zur Prüfung eingereicht.':'Entwurf gespeichert.'};
  }catch(error){return fail(error);}
}
export async function review(target:string,_state:ActionState,data:FormData):Promise<ActionState>{
  const {db}=await admin();
  try {uuid(target);const status=choice(data,'status',['active','suspended','rejected','under_review'] as const);const {error}=await db.rpc('review_partner',{target,new_status:status});check(error);}catch(error){return fail(error);}
  revalidatePath('/admin','layout');return {success:'Partnerstatus wurde geändert und protokolliert.'};
}
export async function saveProfile(_state:ActionState,data:FormData):Promise<ActionState>{
  const {db,user}=await account();
  try {const {error}=await db.from('profiles').update({first_name:text(data,'first_name',100),last_name:text(data,'last_name',100),phone:text(data,'phone',50,false)||null}).eq('user_id',user.id).select('id').single();check(error);}catch(error){return fail(error);}
  revalidatePath('/portal','layout');return {success:'Profil gespeichert.'};
}
export async function securitySettings(_state:ActionState,data:FormData):Promise<ActionState>{
  const {db,user}=await activeAccount();
  try {
    const current=loginPassword(data,'current_password');const reauth=await db.auth.signInWithPassword({email:user.email!,password:current});
    if(reauth.error) throw new ValidationError('Das aktuelle Passwort ist nicht korrekt.');
    if(data.get('mode')==='email') {const {error}=await db.auth.updateUser({email:email(data)},{emailRedirectTo:`${appUrl()}/auth/callback`});check(error);return {success:'Bitte die Änderung über die Bestätigungs-E-Mails abschließen.'};}
    const {error}=await db.auth.updateUser({password:password(data)});check(error);
    const result=await db.auth.signOut({scope:'global'});check(result.error);
  }catch(error){return fail(error);}
  redirect('/login?notice=password');
}
