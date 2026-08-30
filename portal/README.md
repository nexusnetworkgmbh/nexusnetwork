# Nexus Network Partnerportal — Release 1 Implementierungsstand

Eigenständige Next.js-SSR-App als Ergänzung zur bestehenden statischen Website in `../site`. Dark/Gold-Design und vorhandenes Logo übernommen. Keine Demo-Daten oder Auth-Bypässe im laufenden Portal.

**Noch keine Produktionsfreigabe:** Supabase-Projekt, SMTP und OAuth-Provider müssen eingerichtet werden. Die vollständige Auth-/Browser-Abnahme mit realer Supabase-Instanz steht noch aus. Ohne Konfiguration zeigen die Auth-Seiten einen Einrichtungshinweis und deaktivieren Anmeldeaktionen.

## Lokal starten

Node.js >=22.13, pnpm 11.19.0:

```sh
pnpm install --frozen-lockfile
# .env.example als .env.local kopieren und ausfüllen
pnpm dev
```

Portal: `http://localhost:3001/login`. APP_URL muss genau zum verwendeten Browser-Origin passen; nicht zwischen localhost und 127.0.0.1 wechseln, da PKCE-Cookies hostgebunden sind. Für die aktuell gestartete Vorschau wird `http://127.0.0.1:3001` verwendet. Die öffentliche Website bleibt auf Port 4173.

```sh
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm start
node scripts/http-smoke.mjs
```

## Funktionsumfang

- E-Mail/Passwort, Registrierung, Verifizierung/Recovery-Callback, Google-/Apple-OAuth vorbereitet, sichere SSR-Cookies, Logout.
- Partnerprofil, eigenes Unternehmen bei Registrierung, Mandantenmitgliedschaften, manuelle Partnerfreigabe.
- Kundenerfassung/-bearbeitung/-details, Suche, Sortierung und Pagination.
- Vermittlungen mit Datenbanknummer, Statushistorie, internen Notizen und Aufgaben.
- Wiedervorlagen, Aufgabenstatus/-priorität, Verknüpfungen, echtes Datenbank-Dashboard.
- Profil, Passwort/E-Mail-Änderung mit erneuter Passwortprüfung, Sessions.
- Admin-Partnerliste/-prüfung, rollenbasierte Autorisierung, RLS und automatische Audit-Ereignisse.

Produktcenter, Uploads, Provisionen, Support, Notifications, Finanzrechner, KI und aktive MFA-Oberfläche gehören nicht zu dieser Implementierung.

## Dokumentation

- [Analyse](docs/ANALYSIS.md)
- [Einrichtung und Deployment](docs/SETUP.md)
- [Datenbank, Migrationen und Administrator](docs/SUPABASE.md)
- [Auth, Google und Apple](docs/AUTH.md)
- [Sicherheitsmodell](docs/SECURITY.md)
- [Abnahme und offene Tests](docs/TESTING.md)

Keine echten Credentials sind enthalten. `SUPABASE_SECRET_KEY` ist für normale Portalrequests absichtlich unbenutzt. SQL-Migrationen werden nie automatisch gegen eine Cloud-Datenbank ausgeführt.
