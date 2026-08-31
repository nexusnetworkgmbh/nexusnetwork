'use client';

import { FormEvent, useState, useSyncExternalStore } from 'react';
import { prepareContact } from './contact';
const subscribe = () => () => {};

export function ContactForm() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const result = prepareContact(new FormData(form));
    setDraft(result.href || '');
    setMessage(result.error || 'Ihr Entwurf ist bereit. Öffnen Sie ihn im E-Mail-Programm und senden Sie ihn dort ab. Es wurde noch keine Nachricht verschickt.');
  }

  return <form onSubmit={submit} onChange={() => { setDraft(''); setMessage(''); }} noValidate aria-label="Kontaktformular">
    <noscript><p>Bitte nutzen Sie ohne JavaScript unsere direkten E-Mail-Links.</p></noscript>
    <fieldset disabled={!hydrated} className="contact-fields">
    <p className="contact-note">Dieses Formular bereitet eine E-Mail vor. Der Versand erfolgt anschließend in Ihrem E-Mail-Programm. Alternativ erreichen Sie uns direkt über die E-Mail-Adressen daneben.</p>
    <div className="form-grid"><label>Vorname<input name="firstName" maxLength={100} required autoComplete="given-name"/></label><label>Nachname<input name="lastName" maxLength={100} required autoComplete="family-name"/></label><label>Unternehmen<input name="company" maxLength={100} required autoComplete="organization"/></label><label>E-Mail<input name="email" maxLength={254} type="email" required autoComplete="email"/></label><label>Telefon <small>optional</small><input name="phone" maxLength={50} type="tel" autoComplete="tel"/></label><label>Betreff<select name="subject" required defaultValue=""><option value="" disabled>Bitte auswählen</option><option>Finanzberater-Anbindung</option><option>Kooperation</option><option>Allgemeine Anfrage</option></select></label></div>
    <label>Nachricht<textarea name="message" rows={5} required minLength={20} maxLength={2000}/></label><input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
    <label className="consent"><input type="checkbox" name="privacy" required/> Ich habe die <a href="/datenschutz/">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage zu.</label>
    <button className="button primary" type="submit">E-Mail vorbereiten <span>↗</span></button>
    {message && <p className="form-status" role="status">{message}</p>}
    {draft && <a className="text-link" href={draft}>Entwurf im E-Mail-Programm öffnen ↗</a>}
    </fieldset>
  </form>;
}
