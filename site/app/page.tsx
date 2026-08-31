const links = [['Leistungen', '#zusammenarbeit'], ['Für Finanzprofis', '#zielgruppen'], ['Warum Nexus Network', '#vorteile'], ['FAQ', '#faq']];
import { ContactForm } from './contact-form';
import { NetworkField } from './network-field';
import { MobileNavigation } from './mobile-navigation';
import Image from 'next/image';

function BrandLogo({ priority = false }: { priority?: boolean }) {
  return <span className="brand-logo-frame" aria-hidden="true"><Image className="brand-logo" src="/nexus-brand.png" width={740} height={349} alt="" priority={priority} /></span>;
}

export default function Home() {
  return <>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Nexus Network Startseite"><BrandLogo priority /><span className="brand-words"><strong>NEXUS</strong><b>NETWORK</b></span></a>
      <nav aria-label="Hauptnavigation">{links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>
      <a className="header-cta" href="#kontakt">Kontakt<span className="cta-label"> aufnehmen</span></a>
      <MobileNavigation links={links}/>
    </header>
    <main id="top">
      <section className="hero">
        <NetworkField/>
        <div className="hero-copy">
          <p className="eyebrow"><span/> Verbindung. Struktur. Perspektive.</p>
          <h1>Die Verbindung zwischen <em>Finanzfachkräften</em> und Möglichkeiten.</h1>
          <p className="lead">Nexus Network ist die professionelle Anbindungsstelle für Finanzanlagefachkräfte. Wir verbinden Menschen, Kompetenzen und Lösungen für nachhaltigen Erfolg.</p>
          <div className="hero-actions"><a className="button primary" href="#kontakt">Kontakt aufnehmen <span>→</span></a><a className="button secondary" href="#zielgruppen">Mehr erfahren <span>↓</span></a></div>
          <div className="trust-row"><div><strong>Persönlich</strong><span>Direkte Ansprechpartner</span></div><div><strong>Professionell</strong><span>Klare Prozesse</span></div><div><strong>Partnerschaftlich</strong><span>Auf Augenhöhe</span></div></div>
        </div>
        <div className="hero-orbit" aria-hidden="true"><span/><span/><span/></div>
      </section>
      <section className="intro section" id="zielgruppen">
        <div><p className="eyebrow"><span/> Nexus Network im Überblick</p><h2>Eine professionelle Struktur für Menschen, die Finanzberatung eigenständig gestalten.</h2></div>
        <div><p>Nexus Network richtet sich an Finanzanlagefachkräfte, selbstständige Finanzberater und Finanzanlagenvermittler, die eine verlässliche Anbindung und eine klare Zusammenarbeit suchen.</p><p>Im Mittelpunkt steht keine kurzfristige Vermittlung, sondern eine tragfähige geschäftliche Verbindung: persönlich, transparent und mit Raum für die individuelle Entwicklung.</p><a className="text-link" href="/finanzberater-anbindung">Mehr zur Finanzberater-Anbindung <span>→</span></a></div>
      </section>
      <section className="dark-section" id="zusammenarbeit">
        <div className="section-heading"><p className="eyebrow"><span/> So funktioniert die Zusammenarbeit</p><h2>Vom ersten Gespräch zur passenden Verbindung.</h2><p>Wir lernen Ihre Ausgangssituation kennen, klären Erwartungen und prüfen gemeinsam, ob Nexus Network zu Ihrem beruflichen Weg passt.</p></div>
        <div className="steps">{[['01','Kennenlernen','Ihre Tätigkeit, Ziele und Anforderungen stehen am Anfang.'],['02','Einordnung','Wir besprechen transparent, welche Form der Zusammenarbeit sinnvoll ist.'],['03','Anbindung','Bei gegenseitiger Passung gestalten wir die nächsten Schritte strukturiert.'],['04','Begleitung','Ein direkter Austausch bleibt auch nach dem Start selbstverständlich.']].map(([n,t,d])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>
      <section className="section benefits" id="vorteile">
        <div className="section-heading"><p className="eyebrow"><span/> Warum Nexus Network</p><h2>Verbindung braucht Klarheit, Vertrauen und Substanz.</h2></div>
        <div className="cards">{[['Direkte Kommunikation','Sie sprechen mit Menschen, die Ihre Fragen einordnen und Entscheidungen nachvollziehbar machen.'],['Professionelle Abläufe','Klare Zuständigkeiten und strukturierte Prozesse schaffen eine verlässliche Arbeitsgrundlage.'],['Individuelle Perspektive','Ihre Situation wird nicht in ein Standardschema gepresst. Wir betrachten, was fachlich und unternehmerisch passt.'],['Langfristige Ausrichtung','Die Zusammenarbeit ist auf Kontinuität ausgelegt – ohne kurzfristige Versprechen oder unrealistische Aussagen.']].map(([t,d],i)=><article key={t}><span>0{i+1}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>
      <section className="section audience">
        <div><p className="eyebrow"><span/> Für wen wir da sind</p><h2>Eine Anlaufstelle für erfahrene und angehende Finanzprofis.</h2></div>
        <div className="audience-links"><a href="/finanzberater-anbindung"><strong>Selbstständige Finanzberater</strong><span>Professionelle Anbindung und unternehmerische Perspektive →</span></a><a href="/finanzanlagenvermittler"><strong>Finanzanlagenvermittler</strong><span>Strukturierte Zusammenarbeit für die Vermittlungstätigkeit →</span></a></div>
      </section>
      <section className="faq section" id="faq"><div className="section-heading"><p className="eyebrow"><span/> Häufige Fragen</p><h2>Was Finanzfachkräfte vor dem ersten Gespräch wissen möchten.</h2></div><div className="faq-list">{[['An wen richtet sich Nexus Network?','An selbstständige Finanzberater, Finanzanlagenvermittler und weitere Finanzanlagefachkräfte, die eine professionelle geschäftliche Anbindung suchen.'],['Wie beginnt eine Zusammenarbeit?','Mit einem unverbindlichen Kennenlerngespräch. Dabei klären wir Ihre aktuelle Situation, Ihre Ziele und die gegenseitigen Erwartungen.'],['Verspricht Nexus Network bestimmte Erträge?','Nein. Nexus Network macht keine Gewinn- oder Erfolgsversprechen. Im Mittelpunkt stehen eine professionelle Struktur und eine nachvollziehbare Zusammenarbeit.'],['Welche Voraussetzungen gelten?','Die konkreten fachlichen, gewerberechtlichen und organisatorischen Voraussetzungen werden individuell und transparent im Gespräch geklärt.']].map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>
      <section className="contact section" id="kontakt"><div><p className="eyebrow"><span/> Kontakt</p><h2>Lassen Sie uns herausfinden, ob wir zueinander passen.</h2><p>Schildern Sie uns kurz Ihre Situation. Wir melden uns persönlich und ohne unverbindliche Werbeversprechen bei Ihnen.</p><p className="direct">Direkter Kontakt<br/><a href="mailto:hello@nexusnetwork.pro">hello@nexusnetwork.pro</a></p><div className="contact-addresses"><p>Anbindung<br/><a href="mailto:anbindung@nexusnetwork.pro">anbindung@nexusnetwork.pro</a></p><p>Kooperation<br/><a href="mailto:kooperation@nexusnetwork.pro">kooperation@nexusnetwork.pro</a></p><p>Fragen<br/><a href="mailto:frage@nexusnetwork.pro">frage@nexusnetwork.pro</a></p></div></div><ContactForm/></section>
    </main>
    <footer><a className="brand" href="#top" aria-label="Nexus Network Startseite"><BrandLogo /><span className="brand-words"><strong>NEXUS</strong><b>NETWORK</b></span></a><p>Professionelle Verbindungen für Finanzanlagefachkräfte.</p><div><a href="/impressum/">Impressum</a><a href="/datenschutz/">Datenschutz</a><a href="/ratgeber/">Ratgeber</a></div><small>© {new Date().getFullYear()} Nexus Network. Alle Rechte vorbehalten.</small></footer>
  </>;
}
