'use client';

import { FormEvent, useState } from 'react';

// Contact delivery requires a separately reviewed backend; fail closed until then.
const endpoint: string | undefined = undefined;

export function ContactForm() {
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!endpoint) {
      setStatus('error');
      setMessage('Das Kontaktformular wird vor dem Livegang mit einem Formular-Dienst verbunden. Bitte nutzen Sie bis dahin die direkte E-Mail-Adresse.');
      return;
    }
    setStatus('sending'); setMessage('');
    try {
      const response = await fetch(endpoint, { method:'POST', body:new FormData(form), headers:{ Accept:'application/json' } });
      if (!response.ok) throw new Error('send failed');
      form.reset(); setStatus('sent'); setMessage('Vielen Dank. Ihre Nachricht wurde erfolgreich übermittelt.');
    } catch {
      setStatus('error'); setMessage('Die Nachricht konnte nicht gesendet werden. Bitte nutzen Sie die direkte E-Mail-Adresse.');
    }
  }

  return <form onSubmit={submit} noValidate>
    <div className="form-grid"><label>Vorname<input name="firstName" required autoComplete="given-name"/></label><label>Nachname<input name="lastName" required autoComplete="family-name"/></label><label>Unternehmen<input name="company" required autoComplete="organization"/></label><label>E-Mail<input name="email" type="email" required autoComplete="email"/></label><label>Telefon <small>optional</small><input name="phone" type="tel" autoComplete="tel"/></label><label>Betreff<select name="subject" required defaultValue=""><option value="" disabled>Bitte auswählen</option><option>Finanzberater-Anbindung</option><option>Kooperation</option><option>Allgemeine Anfrage</option></select></label></div>
    <label>Nachricht<textarea name="message" rows={5} required minLength={20}/></label><input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
    <label className="consent"><input type="checkbox" name="privacy" required/> Ich habe die <a href="/datenschutz/">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage zu.</label>
    <button className="button primary" type="submit" disabled={status==='sending'}>{status==='sending'?'Wird gesendet …':'Nachricht senden'} <span>↗</span></button>
    {message && <p className={`form-status ${status}`} role="status">{message}</p>}
  </form>;
}
