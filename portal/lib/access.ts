import 'server-only';
import { redirect } from 'next/navigation';
import { configured, supabase } from './supabase';
import { isAdmin, type Profile } from './domain';
export async function account() {
  if(!configured()) redirect('/login?notice=setup');
  const db=await supabase();
  const {data:{user},error}=await db.auth.getUser();
  if(error||!user) redirect('/login');
  if(!user.email_confirmed_at) redirect('/login?notice=verify');
  const {data:profile,error:profileError}=await db.from('profiles').select('*').eq('user_id',user.id).maybeSingle();
  if(profileError||!profile) throw new Error('Profil konnte nicht geladen werden.');
  return {db,user,profile:profile as Profile};
}
export async function activeAccount() {
  const context=await account();
  if(context.profile.status!=='active') redirect('/onboarding');
  return context;
}
export async function tenant() {
  const context=await activeAccount();
  const {data,error}=await context.db.from('organization_members').select('organization_id').eq('user_id',context.user.id).order('created_at').limit(1).maybeSingle();
  if(error||!data) throw new Error('Keine Organisation zugeordnet. Bitte an den Betreiber wenden.');
  return {...context,organizationId:data.organization_id as string};
}
export async function admin() {
  const context=await activeAccount();
  if(!isAdmin(context.profile.role)) redirect('/portal');
  return context;
}
