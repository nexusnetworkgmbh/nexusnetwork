# Statische Veröffentlichung — Nexus Network

Status: **NOT READY FOR PRODUCTION**. Lokaler Export und ein erfolgreicher Workflow sind keine Supabase-Sicherheitsabnahme.

## Was wird gebaut?

Im **Repository-Stamm**: `npm ci`, dann `npm run build`. Das Skript baut `site/` (öffentliche Website) und `portal/` (Partnerportal) und führt beide zu **`out/` im Stamm** zusammen. Nicht nur einen Unterordner hochladen!

- `/`, Impressum, Datenschutz und SEO-Seiten kommen aus site.
- `/login/`, `/register/`, `/auth/callback/`, `/onboarding/`, `/portal/`, `/admin/` kommen aus portal.
- Datensatzdetails: z. B. `/portal/customers/detail/?id=<UUID>`, Bearbeitung `/portal/customers/edit/?id=<UUID>`.
- Website-Assets: `/_next/`; Portal-Assets: `/portal-assets/_next/`. Das ist **kein** Repository-basePath. Die Trennung verhindert Kollisionen zwischen zwei Next-Builds.
- Vollständige Dokumentnavigation beim Wechsel im Portal verhindert, dass der Router eines Builds den anderen übernehmen muss.
- Beide Next-Konfigurationen exportieren statisch und verwenden trailingSlash. Es gibt keinen Node-Produktionsserver, Proxy, Server Action oder dynamischen Route Handler.
- `CNAME` mit `nexusnetwork.pro`, `.nojekyll` und CSP-Metatags werden reproduzierbar vom Root-Build erzeugt.
- `npm run preview` dient nur der lokalen Dateivorschau auf http://127.0.0.1:4173. Ein bereits laufender alter Preview-Server muss ggf. zuvor beendet werden; einen freien Port kann man direkt über `node scripts/serve-static.mjs out 4175` wählen.

## Vor der Hosting-Entscheidung

GitHub Pages ist laut [GitHub-Nutzungsgrenzen](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) kein erlaubter kostenloser Host für hauptsächlich kommerzielle Transaktionen oder kommerzielles SaaS; GitHub warnt zudem vor sensiblen Transaktionen wie Passwortübermittlung. Das ist für dieses Portal ein **offener Eignungs-/Nutzungskonflikt**, auch wenn die Daten an Supabase gehen. Vor Produktion schriftlich klären oder einen geeigneten statischen Host auswählen. Es wurde kein anderer Hostingdienst eingerichtet.

GitHub Pages aus einem **privaten** Repository benötigt einen unterstützten bezahlten GitHub-Tarif. Repository nicht eigenmächtig öffentlich machen. Der Wunsch „kostenlos + privat + Pages“ ist damit nicht ohne Weiteres erfüllbar.

## Betreiber-Schritte 11–16 und 20

Die Schritte 1–10 und 17–19 stehen in [SUPABASE-PRODUCTION.md](SUPABASE-PRODUCTION.md).

### 11. Repository und Workflow

Repository `nexusnetworkgmbh/nexusnetwork` → **Actions**. Dort erscheint nach Push `NexusNetwork GitHub Pages` aus `.github/workflows/deploy-pages.yml`. Er startet bei Push auf main und per **Run workflow**. Der Build arbeitet im Stamm, installiert mit npm ci und prüft Tests, Abhängigkeiten, Quellcode, Build, Typen und Lint. Offizielle Actions: checkout v7, setup-node v7, configure-pages v6, upload-pages-artifact v5, deploy-pages v5 (Releases bei Erstellung geprüft).

Öffentlich: Workflow und Frontend. Geheim: keine Zugangsdaten eintragen. Test: Build-Job grün; Deploy-Job zunächst **skipped**. Das ist beabsichtigt.

### 12. Pages aktivieren

Erst Eignung/Tarif klären. **Settings → Pages → Build and deployment → Source: GitHub Actions**. Nicht „Deploy from a branch“ verwenden. Noch nicht den Freigabeschalter setzen. Test: Pages zeigt Actions als Quelle. Ohne passenden Tarif kann die Einstellung fehlen.

### 13. Build-Variablen

**Settings → Secrets and variables → Actions → Variables → New repository variable**:

| Name | Wert | Vertraulichkeit |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | HTTPS-Projekt-URL aus Supabase | öffentlich |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Publishable Key aus demselben Projekt | öffentlich |
| PAGES_PRODUCTION_APPROVED | zunächst nicht anlegen oder `false` | öffentlicher Freigabeschalter |

`NEXT_PUBLIC_APP_URL=https://nexusnetwork.pro` steht fest im Workflow. Ausschließlich diese drei NEXT_PUBLIC-Werte werden dem statischen Build übergeben. **Keine** Datenbank-, SMTP-, Provider- oder Adminschlüssel verwenden, auch nicht als GitHub Actions Secret für diesen Build. Lokal können die drei öffentlichen Werte in einer ignorierten Root-`.env.local` stehen; Vorlage: `.env.example`. Ohne Supabase-Werte entsteht nur eine gesperrte Vorschau, keine vermeintlich funktionierende Anmeldung.

Test: `npm run build`, `npm run security:build`, `npm run test:static`. Nach Änderung der öffentlichen Variablen neu bauen.

### 14. Custom Domain

Nach Eignungsfreigabe **Settings → Pages → Custom domain: nexusnetwork.pro**. Speichern. Das Build-Artefakt enthält zusätzlich CNAME. Beim Actions-Publishing ersetzt CNAME nicht die Domain-Einstellung im Dashboard. Domain nach GitHub-Anleitung über den dort individuell angezeigten TXT-Wert verifizieren; keinen TXT-Wert erfinden. Öffentlich: Domain und DNS. Test: Domainprüfung erfolgreich.

### 15. Namecheap DNS

Namecheap → Domain List → Manage → Advanced DNS (nur wenn Namecheap die autoritativen Nameserver stellt). Vor Änderungen bestehende Records sichern. Nur kollidierende Web-Records für @/www ersetzen; **MX, SPF, DKIM und andere Mail-Einträge erhalten**.

| Typ | Host | Wert | TTL |
|---|---|---|---|
| A | @ | 185.199.108.153 | Automatic |
| A | @ | 185.199.109.153 | Automatic |
| A | @ | 185.199.110.153 | Automatic |
| A | @ | 185.199.111.153 | Automatic |
| CNAME | www | nexusnetworkgmbh.github.io | Automatic |

Keine Wildcard-DNS-Einträge. Vorhandene widersprechende AAAA- oder URL-Redirect-Records für die Website prüfen. Kein `/nexusnetwork` im DNS-Ziel. Sämtliche DNS-Werte sind öffentlich. Test: `Resolve-DnsName nexusnetwork.pro` und `Resolve-DnsName www.nexusnetwork.pro`; anschließend GitHub-DNS-Check abwarten. Quelle: [GitHub Custom Domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

### 16. HTTPS

Nach Ausstellung des Zertifikats **Settings → Pages → Enforce HTTPS** aktivieren. Test: HTTP wird auf HTTPS umgeleitet, Zertifikat gültig, direkte Aufrufe und Reload von `/login/`, `/register/`, `/portal/` und `/auth/callback/` funktionieren. Die GitHub-Repository-URL unter `github.io/nexusnetwork/` ist bewusst kein unterstützter Produktionspfad.

### 20. Kontrollierte Freigabe

Erst nach vollständiger Checkliste in SECURITY-STATIC.md, echten API-Tests, Hosting-Eignungsfreigabe und Betreiberentscheidung `PAGES_PRODUCTION_APPROVED=true` setzen. Für Environment `github-pages` nach Möglichkeit verpflichtende Reviewer und nur main als Deployment-Branch konfigurieren. **Run workflow** starten und Freigabe bestätigen. Niemals nur zum „Grünmachen“ den Schalter setzen.

Der Workflow baut bei jedem Push, veröffentlicht aber nur, wenn Freigabe **und beide öffentlichen Supabase-Werte** vorhanden sind. DNS, GitHub-Einstellungen, Supabase und Produktionsfreigabe wurden nicht automatisch verändert.

## Rollback

Bei Fehlern Freigabeschalter auf false setzen, laufende Veröffentlichung prüfen/abbrechen, vorherigen geprüften Commit mit einem normalen Revert wiederherstellen. Datenbankänderungen nicht blind zurückrollen. Statisches Frontend-Rollback repariert keine fehlerhafte DB-Policy. Keine Force-Pushes.
