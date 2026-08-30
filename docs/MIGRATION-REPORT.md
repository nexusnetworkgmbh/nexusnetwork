# Migrations- und Deploymentbericht
Stand: 30.08.2026. Urteil: **NOT READY FOR PRODUCTION**.

## A. Static Migration
Erfolgreicher lokaler Gesamtexport: site + portal → Root-out. Kein eigener Produktions-Node-Server und kein Vercel. Entfernt: @supabase/ssr, SSR-Cookies, Next-Proxy, force-dynamic, Server Actions, Callback-Route-Handler und unbeschränkte dynamische [id]-Routen. Buildzeit-Next/Node bleibt erforderlich; Supabase bleibt das vertrauenswürdige Backend.

RLS/Trigger/RPCs nicht durch Browserrollen ersetzt. Neue Such-RPC vermeidet personenbezogene URL-Suchparameter. Bestehendes Design erhalten. Direkte Detailpfade nutzen UUID-Queryparameter.

## B. Build
- npm ci im Stamm: erfolgreich.
- npm run build im Stamm: erfolgreich, site/out + portal/out werden zu out zusammengeführt.
- TypeScript: erfolgreich.
- Lint: erfolgreich, 0 Fehler / 0 Warnungen.
- Statischer Output: 212 Dateien beim geprüften Build, index/login/register/portal/admin/callback vorhanden.
- CNAME: nexusnetwork.pro, .nojekyll vorhanden.
- Beide Asset-Namensräume lokal vorhanden; kein Repository-basePath.

## C. Security
- Zehn Tabellen/RLS/Spaltengrants/Policies und alle eigenen Funktionen lokal geprüft.
- Definer-Funktionen privat, fester search_path, autorisierte RPCs, keine anon-Ausführung.
- Tenant-Isolation, Status-/Rollenschutz, Admin-RPC, Audit-/History-Manipulation und Cross-Tenant-FKs lokal negativ getestet.
- XSS-Anwendungsquellen geprüft; nur statisches escaped JSON-LD als HTML-Sink, kein Nutzer-HTML.
- Dependency-Audit: 0 Befunde nach gezieltem Update auf Next/eslint-config-next 16.3.3.
- Source-Secret-Scan: 0 verdächtige Treffer; zwei exakt dokumentierte Nicht-Secret-Test/UI-Beispiele.
- Build-Secret-Scan: 0 Treffer, kein Service-/SMTP-/Provider-/Datenbankgeheimnis.
- Richtige GitHub-Kontoauswahl für Repository-Zugriff bestätigt. Echter Environment-Inhalt und Build-Ausgaben werden nicht committed.

## D. Testergebnisse
- PostgreSQL/PGlite + Validierung: **34 passed / 0 failed**.
- Static-Dokument-/Asset-/CSP-Tests: **28 passed / 0 failed**.
- Insgesamt: **62 passed / 0 failed**.
- Direkte Supabase-HTTP-Negativtests: **20 vorbereitet, 0 ausgeführt** (kein zugeordnetes NexusNetwork-Projekt/Testzugänge).
- Browser: öffentliche Website, Link zum Login, Registrierung, Reload, gesperrter Portal-Einstieg ohne Konfiguration geprüft; keine beobachteten Console-/CSP-Fehler.
- Nicht behauptet: Anmeldung, CRUD, Adminprüfung, SMTP/Reset/Google mit realem Backend erfolgreich. Ebenso kein echter Supabase-Advisor-/Lint-Nachweis.

## E. Offene Risiken
Verbindliche vollständige Checkliste: [SECURITY-STATIC.md](SECURITY-STATIC.md). Insbesondere:
1. GitHub-Pages-Eignung für kommerzielles/sensibles Portal und Tarif für privates Repo ungeklärt.
2. Kein konfiguriertes/testabgenommenes Supabase-Projekt.
3. Echte API-Isolation, Auth-/Business-Browserabnahme und DB-Advisors fehlen.
4. Browser-Session ist XSS-exponiert; Styles benötigen inline, Pages erlaubt keine zugesicherten eigenen Clickjacking-/Cache-Header.
5. CAPTCHA-UI nicht implementiert; öffentliche Registrierung erst nach Abuse-Abnahme. MFA-/Adminbetrieb separat absichern.
6. SMTP/Verifikation/Redirects/DNS/HTTPS/Google noch manuell einzurichten und zu testen; Apple bleibt aus.
7. Unternehmens-/Rechtstext-Platzhalter und Kontaktversand noch offen.
8. Backup/Restore, Datenschutz-/Aufbewahrungs-/Löschkonzept und Monitoring nicht durch diese Migration erledigt.
9. ESLint-9-Supportende als Wartungsthema; kein ungetesteter Major-Wechsel.
10. Pattern-Scans und lokale Tests sind keine Garantie gegen sämtliche Schwachstellen.

## F. Manuelle Schritte
Alle 20 angeforderten Schritte mit Einstellungen, Geheimnisgrenzen und Nachtests:
- [Supabase: Schritte 1–10, 17–19](SUPABASE-PRODUCTION.md)
- [GitHub, Pages, Namecheap, HTTPS, Freigabe: Schritte 11–16, 20](STATIC-DEPLOYMENT.md)

## G. Workflow
Datei: .github/workflows/deploy-pages.yml. Build aus dem Repository-Stamm, Artefakt ./out. Start auf main-Push und workflow_dispatch. Source in Settings → Pages bleibt GitHub Actions.

Deploy bleibt ohne PAGES_PRODUCTION_APPROVED=true und beide öffentlichen Supabase-Werte gesperrt. Das setzt die ursprüngliche Anweisung um, vor Supabase-Abnahme nicht automatisch produktiv zu veröffentlichen. Keinerlei Änderung an DNS/Pages-Einstellungen/Produktionsdatenbank vorgenommen. Git-Commit/Push-Hash wird im Abschlussbericht genannt, nicht selbstreferenziell in dieser Datei.

**NOT READY FOR PRODUCTION**
