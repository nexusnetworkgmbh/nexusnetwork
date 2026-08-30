'use client';
import {useState} from 'react';
import {onboarding} from '@/lib/actions';
import {onboardingFields} from '@/lib/fields';
import {ActionForm} from './action-form';
import {FieldInput} from './ui';
export function OnboardingForm({values,privacyUrl}:{values:Record<string,string>;privacyUrl:string}){
 const [submit,setSubmit]=useState(false);
 return <ActionForm action={onboarding} label={submit?'Antrag einreichen':'Entwurf speichern'}><div className="form-grid">{onboardingFields.map(field=><FieldInput key={field.name} field={{...field,required:submit&&field.required}} value={values[field.name]}/>)}</div><label className="check"><input name="consent" type="checkbox" required/><span>Ich habe die <a href={privacyUrl}>Datenschutzhinweise</a> gelesen und bestätige die Richtigkeit meiner Angaben.</span></label><label className="check"><input type="checkbox" name="submit" value="yes" checked={submit} onChange={event=>setSubmit(event.target.checked)}/><span>Antrag jetzt verbindlich zur Prüfung einreichen. Danach sind diese Angaben gesperrt.</span></label></ActionForm>;
}
