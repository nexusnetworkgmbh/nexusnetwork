import { dealStatuses, taskStatuses, priorities } from './domain';
export type Section='customers'|'deals'|'tasks';
export interface Field { name:string; label:string; type?:string; required?:boolean; max?:number; options?:readonly string[] }
export const sections:Record<Section,{title:string;singular:string;description:string;fields:Field[]}>= {
 customers:{title:'Kunden',singular:'Kunde',description:'Ihre Kontakte. Klar und zentral organisiert.',fields:[
 {name:'first_name',label:'Vorname',required:true,max:100},{name:'last_name',label:'Nachname',required:true,max:100},
 {name:'email',label:'E-Mail',type:'email',max:254},{name:'phone',label:'Telefon',max:50},{name:'street',label:'Straße / Hausnummer'},
 {name:'postal_code',label:'PLZ',max:20},{name:'city',label:'Ort',max:100},{name:'country',label:'Land',max:100},{name:'internal_notes',label:'Interne Notizen',type:'textarea',max:5000}]},
 deals:{title:'Vermittlungen',singular:'Vermittlung',description:'Vom ersten Entwurf bis zum Abschluss.',fields:[
 {name:'title',label:'Titel',required:true},{name:'customer_id',label:'Kunde',type:'customer',required:true},
 {name:'product_name',label:'Produktname'},{name:'provider_name',label:'Produktgeber'},{name:'investment_amount',label:'Anlagebetrag (EUR)',type:'number'},
 {name:'status',label:'Status',required:true,options:dealStatuses},{name:'internal_notes',label:'Interne Notizen',type:'textarea',max:5000}]},
 tasks:{title:'Aufgaben',singular:'Aufgabe',description:'Das Wesentliche im Blick. Zum richtigen Zeitpunkt.',fields:[
 {name:'title',label:'Titel',required:true},{name:'due_date',label:'Fällig am',type:'date',required:true},
 {name:'priority',label:'Priorität',required:true,options:priorities},{name:'status',label:'Status',required:true,options:taskStatuses},
 {name:'customer_id',label:'Kunde',type:'customer'},{name:'deal_id',label:'Vermittlung',type:'deal'},
 {name:'assigned_to',label:'Zuständig',type:'member',required:true},{name:'description',label:'Beschreibung',type:'textarea',max:5000}]},
};
export function isSection(value:string):value is Section{return ['customers','deals','tasks'].includes(value);}
export const onboardingFields:Field[]=[{name:'first_name',label:'Vorname',required:true,max:100},{name:'last_name',label:'Nachname',required:true,max:100},{name:'phone',label:'Telefon',max:50},{name:'company_name',label:'Firmenname',required:true},{name:'legal_form',label:'Rechtsform',max:100},{name:'street',label:'Straße',required:true},{name:'house_number',label:'Hausnummer',required:true,max:30},{name:'postal_code',label:'PLZ',required:true,max:20},{name:'city',label:'Ort',required:true,max:100},{name:'country',label:'Land',required:true,max:100},{name:'professional_title',label:'Tätigkeitsbezeichnung',required:true},{name:'registration_number',label:'Vermittler-/Registrierungsnummer',max:100},{name:'responsible_authority',label:'Zuständige Stelle'}];
