# Nexus Network — statische Website und Partnerportal

Next.js 16.3.3 / React 19.2.6, statischer Export für Website und Portal. Vertrauenswürdiges Backend: Supabase Auth + PostgreSQL + RLS/RPC/Trigger. **NOT READY FOR PRODUCTION**: echte Supabase-Abnahme und Hosting-Eignung stehen aus.

## Lokal starten

Node.js 24 empfohlen (mindestens 22.13). Im Repository-Stamm:

```powershell
npm ci
npm run build
npm run preview
```

`npm install` ist bei beabsichtigten Dependency-Änderungen möglich; `npm ci` reproduziert das committed package-lock.json. Keine parallelen pnpm-Lockfiles verwenden.

Entwicklung: `npm run dev` (Portal, Port 3001), `npm run dev:site` (Website, Port 3000). Nur der gemeinsame Root-Build und seine Vorschau liefern beide Anwendungen unter derselben Origin. Für Dev öffentliche Variablen in portal/.env.local setzen; der Gesamt-Build liest die ignorierte Root-.env.local.

## Struktur

- site/: öffentliche Website, SEO, Impressum/Datenschutz, bestehendes Design
- portal/: statisches Portal, Browser-Auth, Datenzugriff mit normalen User-JWTs
- portal/supabase/migrations/: zwei geordnete SQL-Migrationen
- scripts/build-static.mjs: beide Exporte zusammenführen, CSP, CNAME, Build-Scan
- out/: generiertes Gesamt-Artefakt, nicht in Git
- .github/workflows/deploy-pages.yml: Build auf main/manuell; Deployment mit expliziter Freigabe

Nur NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY sind Build-Konfiguration. .env.example enthält leere Werte. Kein Secret wird für den Build benötigt. Ohne Supabase-Konfiguration ist der Zugang absichtlich gesperrt.

## Prüfungen

```powershell
npm test
npm run typecheck
npm run lint
npm run test:static
npm run security:source
npm run security:build
npm audit
```

Typecheck und Static-Tests nach dem Build ausführen. `npm run test:api` benötigt ausschließlich synthetische Testaccounts in einem isolierten echten Supabase-Projekt; Details in der Betreiberanleitung. Lokale SQL-Tests sind keine vollständige REST/Auth-Abnahme.

## Betrieb und Freigabe

- [Statisches Deployment / GitHub / Namecheap](docs/STATIC-DEPLOYMENT.md)
- [Supabase einrichten, Auth, Migrationen, Erstadmin, echte API-Tests](docs/SUPABASE-PRODUCTION.md)
- [Sicherheitsgrenzen, RLS-Matrix und offene Risiken](docs/SECURITY-STATIC.md)
- [Bestandsaufnahme / Migrationsmatrix](docs/MIGRATION-MATRIX.md)

GitHub Pages für private Repositories benötigt einen passenden Tarif; außerdem besteht bei kommerzieller/sensibler Portalnutzung ein offener Konflikt mit den Pages-Nutzungsgrenzen. Kein unbeaufsichtigtes Produktionsdeployment: PAGES_PRODUCTION_APPROVED bleibt unset/false bis zur dokumentierten Abnahme.

Alte Serverimplementierung und pnpm-Stände sind in Git-Historie/lokaler ignorierter Sicherung nachvollziehbar. Frühere Dokumente unter portal/docs sind als historische R1-SSR-Dokumentation markiert. Keine echten Kundendaten, Environment-Dateien oder lokale Build-/Cache-Dateien committen.
