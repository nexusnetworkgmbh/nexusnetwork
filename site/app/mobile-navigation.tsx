'use client';
import { useRef } from 'react';

export function MobileNavigation({ links }: { links: string[][] }) {
  const menu = useRef<HTMLDetailsElement>(null);
  return <details className="mobile-menu" ref={menu} onKeyDown={event => {
    if (event.key === 'Escape' && menu.current) {
      menu.current.open = false;
      menu.current.querySelector('summary')?.focus();
    }
  }}>
    <summary aria-label="Navigation öffnen oder schließen">Menü <span aria-hidden="true">☰</span></summary>
    <nav aria-label="Mobile Hauptnavigation">
      {[...links, ['Kontakt', '#kontakt']].map(([label, href]) => <a key={href} href={href} onClick={() => {
        if (menu.current) menu.current.open = false;
        menu.current?.querySelector('summary')?.focus();
      }}>{label}</a>)}
    </nav>
  </details>;
}
