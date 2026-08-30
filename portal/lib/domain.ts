export const accountStatuses = ['pending','under_review','active','suspended','rejected'] as const;
export type AccountStatus = typeof accountStatuses[number];
export const roles = ['partner','admin','super_admin','compliance','finance','support'] as const;
export type Role = typeof roles[number];
export const dealStatuses = ['draft','documents_missing','ready','submitted','in_review','question','accepted','completed','rejected','cancelled'] as const;
export const taskStatuses = ['open','in_progress','completed','cancelled'] as const;
export const priorities = ['low','normal','high','urgent'] as const;
export const labels: Record<string,string> = { pending:'Onboarding offen',under_review:'In Prüfung',active:'Freigegeben',suspended:'Gesperrt',rejected:'Abgelehnt',draft:'Entwurf',documents_missing:'Unterlagen fehlen',ready:'Bereit',submitted:'Eingereicht',in_review:'In Prüfung',question:'Rückfrage',accepted:'Angenommen',completed:'Abgeschlossen',cancelled:'Storniert',open:'Offen',in_progress:'In Bearbeitung',low:'Niedrig',normal:'Normal',high:'Hoch',urgent:'Dringend' };
export interface Profile { id:string; user_id:string; first_name:string; last_name:string; phone:string|null; status:AccountStatus; role:Role; created_at:string; updated_at:string }
export interface PartnerProfile { id:string; organization_id:string; user_id:string; company_name:string; legal_form:string|null; street:string; house_number:string; postal_code:string; city:string; country:string; professional_title:string; registration_number:string|null; responsible_authority:string|null; submitted_at:string|null; onboarding_completed_at:string|null }
export interface Customer { id:string; organization_id:string; first_name:string; last_name:string; email:string|null; phone:string|null; street:string|null; postal_code:string|null; city:string|null; country:string|null; internal_notes:string|null; created_at:string; updated_at:string }
export interface Deal { id:string; organization_id:string; customer_id:string; created_by:string; deal_number:string; title:string; product_name:string|null; provider_name:string|null; investment_amount:number|null; status:typeof dealStatuses[number]; internal_notes:string|null; created_at:string; updated_at:string }
export interface Task { id:string; organization_id:string; title:string; description:string|null; due_date:string; priority:typeof priorities[number]; status:typeof taskStatuses[number]; customer_id:string|null; deal_id:string|null; assigned_to:string; created_by:string; created_at:string; updated_at:string; completed_at:string|null }
export interface Note { id:string; content:string; created_by:string; created_at:string }
export interface History { id:string; old_status:string|null; new_status:string; changed_at:string; changed_by:string|null }
export interface Audit { id:string; action:string; entity_type:string; entity_id:string; actor_id:string|null; created_at:string }
export function isAdmin(role:Role) { return role === 'admin' || role === 'super_admin'; }
export function formatDate(value:string|null) { return value ? new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',dateStyle:'medium'}).format(new Date(value)) : '—'; }
export function money(value:number|null) { return value === null ? '—' : new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(value); }
export function today() { return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date()); }
