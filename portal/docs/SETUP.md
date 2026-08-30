# Einrichtung und Deployment

## 1. Lokaler Stand

`../site` bleibt eine statische Website. `portal` benötigt einen Node.js-Server und Supabase. Node >=22.13 und pnpm 11.19.0 installieren. Im Portal `pnpm install --frozen-lockfile` ausführen. Dann `.env.example` nach `.env.local` kopieren, ohne sie einzuchecken.

| Variable | Bedeutung |
| --- | --- |
| NEXT_PUBLIC_APP_URL | Exakter Portal-Origin, lokal `http://127.0.0.1:3001`, später `https://nexusnetwork.pro` bei gemeinsamem Routing |
| NEXT_PUBLIC_WEBSITE_URL | Lokale Website `http://localhost:4173`, Produktion `https://nexusnetwork.pro` |
| NEXT_PUBLIC_SUPABASE_URL | Project URL aus dem gewählten Supabase-Projekt |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Publishable Key desselben Projekts |
| SUPABASE_SECRET_KEY | Nur für separat autorisierte Administration; vom Portal nicht benötigt/verwendet |
| AUTH_GOOGLE_ENABLED | Erst nach erfolgreicher Providerkonfiguration `true` |
| AUTH_APPLE_ENABLED | Erst nach erfolgreicher Providerkonfiguration `true` |

Die veröffentlichbaren Supabase-Werte sind keine administrativen Secrets. Trotzdem niemals Secret-/Service-Role-Keys in NEXT_PUBLIC-Variablen ablegen.

## 2. Supabase bereitstellen

Ein **dediziertes Nexus Network-Projekt** auswählen oder neu anlegen. Das vorhandene andere Projekt wurde nicht verändert. Region, Kosten und Betreiberkonto müssen vor Cloud-Projekterstellung festgelegt werden.

Alternativ lokale Supabase-Instanz: Docker Desktop installieren/starten, im Portal `pnpm exec supabase init`, anschließend `pnpm exec supabase start`. Die CLI ist fest versioniert. Vor Verwendung weiterer CLI-Kommandos deren `--help` prüfen. Keine Cloud-Secrets für die lokale Instanz verwenden. Ohne Docker funktioniert weiterhin `pnpm test` mit eingebettetem PostgreSQL, aber nicht die vollständige Auth-API.

Migrationen aus `supabase/migrations` in lexikografischer Reihenfolge ausführen; Details in SUPABASE.md. Auth-Projekt gemäß AUTH.md konfigurieren. Erst danach `pnpm dev` starten und einen Testaccount registrieren.

## 3. Öffentliche Website verknüpfen

In `../site/.env.local` `NEXT_PUBLIC_PORTAL_URL` auf die vollständige Login-URL setzen. Der Header-Button „Partner-Login“ ist die einzige Portal-bezogene Änderung am öffentlichen Layout. Die übrigen Kontaktmöglichkeiten bleiben bestehen. Website nach Environment-Änderung neu bauen. In GitHub Actions dieselbe Variable setzen.

## 4. Produktionsbetrieb

Das Portal kann **nicht** auf GitHub Pages ausgeführt werden. Einen Next.js-kompatiblen Node-Host verwenden und `pnpm build` / `pnpm start` nutzen. Secrets in dessen Secret-Store setzen. `NEXT_PUBLIC_*`-Variablen bereits beim Build korrekt setzen.

Zwei mögliche, noch nicht eingerichtete Topologien:

1. `nexusnetwork.pro` Website + Portal über gemeinsamen Reverse Proxy. Auth-/Portal-/Admin-Routen und Portal-`/_next/*` zum Node-Server routen. Statische Next-Assets der Website kollidieren sonst mit Portal-Assets: eine gemeinsame Deployment-Integration mit getrenntem Asset-Prefix ist vor diesem Modell erforderlich. Nicht einfach beide `/_next`-Verzeichnisse übereinanderlegen.
2. Einfacher: statische Website unter `nexusnetwork.pro`, Portal unter `portal.nexusnetwork.pro`. Portal APP_URL, Supabase Site URL, Redirect-Allowlist und Website-Link auf diese Subdomain setzen. Diese Variante vermeidet Asset- und Cookie-Kollisionen.

HTTPS erzwingen, HSTS am gewählten Host aktivieren, keine CDN-Caches auf personalisierten Antworten oder Set-Cookie-Antworten. Backups/Restore-Probe, Monitoring ohne personenbezogene Inhalte, Auth-Rate-Limits, SMTP, Passwort-/Session-Richtlinien und Betreiber-Datenschutzhinweise vor Freigabe prüfen. Gegen ein bestehendes produktives Schema niemals ungeprüft diese Erstinstallation ausführen.

## 5. Release-Gate

Tests aus TESTING.md auf einer dedizierten Testinstanz abschließen. Der aktuelle Stand ist nicht als produktiv abgenommen gekennzeichnet. Kein automatisches Deployment und keine Änderung an Domains/DNS wurden vorgenommen.
