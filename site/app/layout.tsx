import type { Metadata } from 'next';
import './globals.css';
import { company } from './company';

export const metadata: Metadata = {
  metadataBase: new URL(company.url),
  title: 'Nexus Network | Professionelle Anbindung für Finanzberater',
  description: 'Nexus Network verbindet selbstständige Finanzberater und Finanzanlagenvermittler mit einer professionellen, partnerschaftlichen Struktur.',
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: '/nexus-brand.png', type: 'image/png' }],
    shortcut: '/nexus-brand.png',
    apple: '/nexus-brand.png',
  },
  openGraph: { type:'website', locale:'de_DE', siteName:'Nexus Network', title:'Nexus Network | Professionelle Anbindung für Finanzberater', description:'Die Verbindung für Finanzanlagefachkräfte.', images:[{url:'/og.png?v=nexus-network',width:1731,height:909,alt:'Nexus Network – Die Verbindung für Finanzanlagefachkräfte'}] },
  twitter: { card:'summary_large_image', title:'Nexus Network', description:'Die Verbindung für Finanzanlagefachkräfte.', images:['/og.png?v=nexus-network'] },
  robots: { index:true, follow:true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Unverified operator placeholders must never be presented as factual structured data.
  const schema = { '@context':'https://schema.org', '@type':'Organization', name:company.name, url:company.url, email:company.email, logo:company.url+'/nexus-brand.png' };
  return <html lang="de"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/></body></html>;
}
