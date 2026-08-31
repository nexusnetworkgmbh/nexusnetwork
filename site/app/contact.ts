export const recipients = {
  'Finanzberater-Anbindung': 'anbindung@nexusnetwork.pro',
  'Kooperation': 'kooperation@nexusnetwork.pro',
  'Allgemeine Anfrage': 'frage@nexusnetwork.pro',
} as const;

export function prepareContact(data: FormData): { href?: string; error?: string } {
  const value = (name: string) => String(data.get(name) ?? '').trim();
  if (value('website')) return { error: 'Die Anfrage konnte nicht vorbereitet werden. Bitte nutzen Sie den direkten E-Mail-Kontakt.' };
  for (const name of ['firstName', 'lastName', 'company']) {
    if (!value(name) || value(name).length > 100 || /[\r\n]/.test(value(name))) return { error: 'Bitte prüfen Sie Name und Unternehmen (maximal 100 Zeichen).' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email')) || value('email').length > 254) return { error: 'Bitte geben Sie eine gültige E-Mail-Adresse an.' };
  if (value('phone').length > 50 || /[\r\n]/.test(value('phone'))) return { error: 'Bitte prüfen Sie Ihre Telefonnummer.' };
  if (value('message').length < 20 || value('message').length > 2000) return { error: 'Bitte schreiben Sie eine Nachricht mit 20 bis 2.000 Zeichen.' };
  if (value('privacy') !== 'on') return { error: 'Bitte bestätigen Sie den Datenschutzhinweis.' };
  const subject = value('subject');
  if (!Object.hasOwn(recipients, subject)) return { error: 'Bitte wählen Sie einen Betreff aus.' };
  const recipient = recipients[subject as keyof typeof recipients];
  const body = [
    value('message'), '', 'Name: '+value('firstName')+' '+value('lastName'),
    'Unternehmen: '+value('company'), 'E-Mail: '+value('email'),
    ...(value('phone') ? ['Telefon: '+value('phone')] : []),
  ].join('\r\n');
  return { href: 'mailto:'+recipient+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body) };
}
