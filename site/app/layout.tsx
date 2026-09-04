import type { Metadata } from 'next';
import './globals.css';
import { company, pageMetadata } from './company';

const description = 'Nexus Network verbindet Finanzberater und Finanzanlagenvermittler mit klarer Anbindung, direktem Austausch und sicheren Abläufen im Berufsalltag.';

export const metadata: Metadata = {
  ...pageMetadata('/', 'Nexus Network | Professionelle Anbindung für Finanzberater', description),
  metadataBase: new URL(company.url),
  icons: {
    icon: [{ url: '/nexus-brand.png', type: 'image/png' }],
    shortcut: '/nexus-brand.png',
    apple: '/nexus-brand.png',
  },
  robots: { index:true, follow:true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Unverified operator placeholders must never be presented as factual structured data.
  const schema = { '@context':'https://schema.org', '@type':'Organization', name:company.name, url:company.url, email:company.email, logo:company.url+'/nexus-brand.png' };
  return <html lang="de"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/></body></html>;
}
