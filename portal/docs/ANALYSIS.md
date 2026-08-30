# Bestandsanalyse und Architekturentscheidung

Stand: 30.08.2026, vor Portalimplementierung geprüft.

| Bereich | Bestand / Entscheidung |
| --- | --- |
| Öffentliche Website | `../site`, Next.js 16.2.6 App Router, React 19.2.6 |
| Sprache | TypeScript 5.9.3, strict aktiv |
| Darstellung | Globales CSS, dunkel/navy/gold, individuelles Logo, Header/Footer |
| Komponenten | ContactForm, NetworkField, servergerenderte Inhaltsseiten |
| Navigation | Anker für Leistungen, Zielgruppen, Vorteile, FAQ; Kontakt und Rechtstexte |
| Environment | NEXT_PUBLIC_SITE_URL und CONTACT_FORM_ENDPOINT; keine Auth-Secrets |
| Supabase | Keine bestehende Integration; kein passendes Projekt verbunden |
| Deployment | `output: export`, GitHub Pages Workflow, lokales `out` auf Port 4173 |
| Versionsverwaltung | Bestehendes Git-Repository in `site`; vorhandene Änderungen erhalten |

SSR-Sessions, Server Actions und nicht-statische Detailseiten funktionieren nicht auf GitHub Pages. Deshalb eigenständige Next.js-App unter `../portal`, mit eigenem Paket-/Lockfile, CSS und Build. Kein Umbau der öffentlichen Website. Nur der Header-Button führt nun zum konfigurierbaren Partner-Login. Die Portal-App ist aktuell außerhalb des bestehenden `site`-Git-Repositories: vor Versionierung als eigenes Repository aufnehmen oder die beiden Apps kontrolliert in ein Monorepo überführen. Keine automatische Git-Umbauten vorgenommen.

Zielbetrieb: Website weiter statisch; Portal auf Node.js-Hosting. Für `/login`, `/auth/*`, `/portal/*`, `/admin/*`, `/onboarding`, `/register`, `/forgot-password`, `/reset-password` unter `nexusnetwork.pro` ist ein gemeinsamer Reverse Proxy nötig. Alternativ Portal vollständig unter `portal.nexusnetwork.pro` betreiben und APP_URL, Redirects und Website-Link entsprechend anpassen. Kein Deployment und keine Domainänderung ausgeführt.

Website und Portal verwenden nach der Umbenennung einheitlich „Nexus Network“. Die Wortmarken, Seitentitel, Metadaten und das öffentliche Social-Preview-Bild wurden entsprechend angepasst. Die nicht indexierbare Portal-App benötigt kein separates Social-Preview-Bild.
