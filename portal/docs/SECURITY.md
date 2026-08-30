> HISTORISCH: Dieser Text beschreibt den ursprünglichen SSR-Stand, nicht die aktuelle statische Architektur. Verbindlich sind die drei Anleitungen unter ../../docs/STATIC-DEPLOYMENT.md, ../../docs/SUPABASE-PRODUCTION.md und ../../docs/SECURITY-STATIC.md.

# Sicherheitsmodell

## Vertrauensgrenzen

- Browser liefert keine vertrauenswürdigen Rollen, Accountstatus oder Mandanten-IDs.
- Server Actions validieren Identität mit Supabase Auth, prüfen aktuellen Status/Rolle und bestimmen die Organisation anhand der Mitgliedschaft.
- CRUD verwendet nur Publishable Key + Nutzersession, niemals einen RLS-umgehenden Secret Key.
- RLS prüft dieselben Grenzen nochmals bei direkten API-Aufrufen. Aktive Mitgliedschaft ist für Geschäftsdaten notwendig.
- Sensitive Authorization nutzt keine user_metadata. Die Rollen compliance/finance/support sind vorbereitet, besitzen aber keine Adminfreigaberechte. admin und super_admin dürfen Partner prüfen; nicht automatisch fremde Geschäftsdaten lesen.

## Sessions

Private DB-Helfer prüfen auth.uid, bestätigte E-Mail und vorhandene auth.sessions-Zeile samt not_after. Damit werden widerrufene/abgelaufene Sessions trotz noch nicht abgelaufenem JWT abgewiesen. Supabase Data API validiert zusätzlich das JWT. UI-Routen prüfen serverseitig, keine reine Layout-/Button-Sperre. Nach Suspension schlägt der Geschäftsdatenzugriff sofort fehl. Profil- und eigene Statusdaten bleiben für die Statusseite erreichbar.

Tokens werden ausschließlich von `@supabase/ssr` in Cookies verwaltet. Proxy übernimmt Refresh, Antworten sind private/no-store. Keine ISR/CDN-Caches für die Portal-App. Vollständige CSP mit Nonces ist noch nicht implementiert; derzeit sind frame-ancestors, object-src, base-uri und form-action eingeschränkt, zusätzlich DENY/nosniff/no-referrer. HTTPS/HSTS gehört zur Hostingkonfiguration.

## Datenintegrität

- RLS auf allen öffentlichen Geschäftstabellen; explizite minimale Grants.
- Zusammengesetzte Fremdschlüssel verhindern Cross-Tenant-Beziehungen, auch bei UUID-Manipulation.
- Einfüge-Trigger bestimmen created_by selbst. Änderungen an organization_id, id, created_by, created_at und Vermittlungsnummern werden verworfen.
- Profil-Updates für Partner haben nur Spaltenrechte auf first_name, last_name, phone.
- Keine normalen Schreibrechte auf Organisationsmitgliedschaften, Profilrolle oder Freigabestatus.
- Freigabe-RPC prüft aktiven Admin in der DB, akzeptiert nur Partnerziele und keine Selbstfreigabe.
- Onboarding-RPC lässt nur pending-Eigentümer zu; Einreichen sperrt weitere Änderungen und setzt ausschließlich under_review.
- Aktive Freigabe erfordert vorher eingereichten Antrag.
- Historie und Audit sind append-only für sämtliche Approllen. DB-Betreiber bleiben notwendigerweise privilegiert.
- Keine Geschäftsdatenlöschung in R1. Erasure/Retention-Prozess muss vor produktiver Datenverarbeitung betrieblich geregelt werden.

Security-definer-Helfer liegen ausschließlich in `private` und nutzen `search_path=''`. Öffentlich erreichbare RPC-Wrapper sind security invoker. Nur explizit benötigte private Funktionen sind ausführbar. Triggerfunktionen sind nicht direkt für Approllen ausführbar.

## Datenschutz

Keine Analytics, kein Error-Tracking, kein Logging von Kundennamen, Passwörtern, Request-Payloads oder Secrets. Audit enthält Aktion/IDs/Zeit und bei Partnerstatuswechsel nur alte/neue Status-/Rollenwerte. Keine Notiz-/Kundeninhalte im Audit. URLs verwenden UUIDs; Kundensuche und Filter werden per Server Action ausschließlich in POST-Bodies übertragen. Keine Kundennamen/E-Mails in Such-URLs oder Browser-Speichern. Hosting-Logs dürfen keine Request-Bodies erfassen.

## Vor Freigabe

Echte RLS-/Auth-Integrationstests, Supabase Advisors, SMTP- und Providerprüfung, Recovery-/Sessionablauf, mobile Geschäftsmasken mit Testdaten, Passwort-/Rate-Limit-Konfiguration, Backups, Datenschutztexte und Hosting-Sicherheitskonfiguration abschließen. Automatisierte SQL-Tests ersetzen keinen Penetrationstest oder Betreiberfreigabe.
