export const company = {
  name: 'Nexus Network', legalName: 'Nexus Network', legalForm: '[RECHTSFORM]',
  street: '[STRASSE UND HAUSNUMMER]', postalCode: '[PLZ]', city: '[ORT]', country: 'DE',
  email: 'hello@nexusnetwork.pro', phone: '[TELEFONNUMMER]', ceo: '[GESCHÄFTSFÜHRER]',
  register: '[HANDELSREGISTER]', registerNumber: '[REGISTERNUMMER]', vatId: '[UST-ID]',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://nexusnetwork.pro').replace(/\/$/, ''),
};

export function pageMetadata(path: string, title: string, description: string) {
  const url = `${company.url}${path === '/' ? '/' : path}`;
  return {
    alternates: { canonical: path }, title, description,
    openGraph: { type: 'website' as const, locale: 'de_DE', siteName: company.name, title, description, url, images: [{ url: '/og.png?v=nexus-network', width: 1731, height: 909, alt: 'Nexus Network – Die Verbindung für Finanzanlagefachkräfte' }] },
    twitter: { card: 'summary_large_image' as const, title, description, images: ['/og.png?v=nexus-network'] },
  };
}
