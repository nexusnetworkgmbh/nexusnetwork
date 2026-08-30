# NexusNetwork — Nexus Network

Öffentliche Unternehmenswebsite und geschütztes Partnerportal für Finanzanlagevermittler. Die Website bleibt statisch; das Portal verwendet Next.js SSR, Supabase Auth, PostgreSQL und mandantenbezogene Row Level Security.

## Projektstruktur

- `site/`: öffentliche Website, Next.js 16 / React 19, statischer Export.
- `portal/`: Server-App mit Auth, Onboarding, Freigabe, Kunden, Vermittlungen, Aufgaben und Audit.
- `portal/supabase/migrations/`: versionierte Datenbankmigrationen.
- `scripts/`: lokale Sicherheitsprüfung vor einem Commit/Push.

## Lokale Installation

Node.js >=22.13 und pnpm 11.19.0 verwenden. Beide Apps haben eigene, festgeschriebene pnpm-Lockfiles:

```sh
cd site
pnpm install --frozen-lockfile
pnpm dev
```

In einem zweiten Terminal:

```sh
cd portal
pnpm install --frozen-lockfile
pnpm dev
```

Website im Dev-Modus: `http://localhost:3000`, Portal: `http://localhost:3001/login`. Die bisherige statische Website-Vorschau auf Port 4173 ist ein separater lokaler Server, nicht Teil des Repositorys.

Falls ausschließlich npm verfügbar ist, funktionieren innerhalb der jeweiligen App alternativ `npm install` und `npm run dev`. Für reproduzierbare Team-/CI-Installationen bleibt pnpm mit dem eingecheckten Lockfile maßgeblich; keine konkurrierenden Lockfiles einchecken.

## Environment

Je App `.env.example` nach `.env.local` kopieren und lokal ausfüllen. Die Vorlagen enthalten ausschließlich leere Werte, niemals Zugangsdaten.

Website benötigt `NEXT_PUBLIC_SITE_URL`, optional `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT`, sowie `NEXT_PUBLIC_PORTAL_URL` für den Login-Link. Bei lokaler Entwicklung die Portal-URL auf `http://localhost:3001/login` setzen.

Portal benötigt `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_WEBSITE_URL`, `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `AUTH_GOOGLE_ENABLED` / `AUTH_APPLE_ENABLED` erst nach Providerkonfiguration auf `true` setzen. `SUPABASE_SECRET_KEY` ist nur für separat ausgeführte lokale Integrationstests/Administration vorgesehen und wird vom normalen Portal nicht verwendet. Alle Werte gehören in lokale Environment-Dateien oder den Secret-Store des späteren Hosts.

## Supabase, Migrationen und Auth

Ein eigenes NexusNetwork-Testprojekt oder eine lokale Supabase-Instanz mit Docker bereitstellen. Das Portal sperrt Login-Aktionen, solange Supabase nicht eingerichtet ist; kein Demo-Login.

1. Supabase-URL und Publishable Key lokal eintragen.
2. Migrationen in `portal/supabase/migrations/` in aufsteigender Reihenfolge auf der ausgewählten leeren Instanz anwenden. Vor Cloud-Anwendung Zielprojekt und Backup prüfen; nie gegen eine fremde Anwendung ausführen.
3. E-Mail-Bestätigung, SMTP, Site URL und erlaubte Callback-URLs konfigurieren.
4. Google-/Apple-Secrets ausschließlich beim Auth-Provider hinterlegen.
5. Ersten Administrator nach Identitätsprüfung gemäß Dokumentation einrichten.

Details: [Setup](portal/docs/SETUP.md), [Datenbank und Admin](portal/docs/SUPABASE.md), [Auth](portal/docs/AUTH.md), [Sicherheitsmodell](portal/docs/SECURITY.md).

## Prüfungen

Im Portal: `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`. Website: `pnpm build`. Vor einem Commit im Hauptverzeichnis `node scripts/security-audit.mjs worktree` und nach dem Vormerken `node scripts/security-audit.mjs staged` ausführen. Potenzielle Treffer müssen manuell geprüft werden; ein Musterscan garantiert keine vollständige Secret-Erkennung.

Die 26 lokalen PostgreSQL-/Validierungstests und HTTP-Smoketests ersetzen nicht die echte Auth-/OAuth-/SMTP-Abnahme. [Teststand und offene Abnahme](portal/docs/TESTING.md).

## Deployment

Dieser Git-Push veröffentlicht keine Website. Build-Ausgaben, Abhängigkeiten und lokale Datenbanken werden nicht eingecheckt. Es ist kein automatischer Deployment-Workflow im Root aktiviert.

Die öffentliche Website kann separat auf GitHub Pages bereitgestellt werden. Das Portal benötigt Next.js-kompatibles Serverhosting; GitHub Pages kann es nicht ausführen. Geplante Hauptdomain: `https://nexusnetwork.pro`. Domain-, Hosting- und OAuth-Konfiguration sind separate Schritte. Der bisherige Workflow unter `site/.github/` ist in dieser Monorepo-Struktur lediglich eine Vorlage und wird von GitHub nicht automatisch ausgeführt.
