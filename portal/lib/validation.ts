export class ValidationError extends Error {}
export function text(data:FormData,name:string,max=200,required=true) {
  const raw=data.get(name);
  if (raw !== null && typeof raw !== 'string') throw new ValidationError('Ungültige Eingabe.');
  const value=(raw ?? '').trim();
  if ((required && !value) || value.length>max) throw new ValidationError(`Bitte das Feld „${name}“ prüfen (max. ${max} Zeichen).`);
  return value;
}
export function uuid(value:string) { if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new ValidationError('Ungültige Referenz.'); return value; }
export function optionalId(data:FormData,name:string) { const value=text(data,name,36,false); return value ? uuid(value) : null; }
export function choice<T extends string>(data:FormData,name:string,allowed:readonly T[]):T { const value=text(data,name,40); if(!allowed.includes(value as T)) throw new ValidationError('Ungültige Auswahl.'); return value as T; }
export function email(data:FormData,required=true) { const value=text(data,'email',254,required).toLowerCase(); if(value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new ValidationError('Bitte eine gültige E-Mail-Adresse eingeben.'); return value; }
export function password(data:FormData,name='password') { const value=data.get(name); if(typeof value!=='string'||value.length<12||value.length>128) throw new ValidationError('Das Passwort muss 12 bis 128 Zeichen lang sein.'); return value; }
export function loginPassword(data:FormData,name='password') { const value=data.get(name); if(typeof value!=='string'||!value||value.length>128) throw new ValidationError('Bitte das Passwort eingeben.'); return value; }
export function date(data:FormData,name:string) { const value=text(data,name,10); if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value) throw new ValidationError('Bitte ein gültiges Datum eingeben.'); return value; }
export function amount(data:FormData) { const value=text(data,'investment_amount',18,false); if(!value) return null; if(!/^\d{1,12}(\.\d{1,2})?$/.test(value)) throw new ValidationError('Bitte einen positiven Betrag mit maximal zwei Nachkommastellen eingeben.'); return Number(value); }
export function pageNumber(value:string|undefined) { const n=Number(value??1); return Number.isSafeInteger(n)&&n>0&&n<=100000?n:1; }
export function searchTerm(value:string|undefined) { return (value??'').replace(/[^\p{L}\p{N} @.\-]/gu,'').slice(0,100); }
export function safeNext(value:string|null) { return value==='/reset-password'?value:'/portal'; }
