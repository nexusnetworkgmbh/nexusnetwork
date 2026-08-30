# Auth-Einrichtung

## Allgemein

Die Implementierung verwendet `@supabase/ssr` mit PKCE, serverseitigen Clients pro Request und Next.js Proxy für Cookie-Aktualisierung. `getUser()` validiert die Identität für Server Requests; Rechte kommen aus Datenbanktabellen. Es wird kein Browser-Supabase-Client benötigt: Cookies sind deshalb HttpOnly, SameSite=Lax und bei HTTPS Secure. Kein localStorage für Tokens.

Supabase Auth → URL Configuration:

- Site URL: der tatsächliche `NEXT_PUBLIC_APP_URL`, geplant `https://nexusnetwork.pro`.
- Zulässige Redirects: exakt `https://nexusnetwork.pro/auth/callback` und `https://nexusnetwork.pro/auth/callback?next=/reset-password`.
- Entwicklung zusätzlich `http://127.0.0.1:3001/auth/callback` und `http://127.0.0.1:3001/auth/callback?next=/reset-password` (bzw. konsequent localhost).
- Keine beliebigen Produktions-Wildcards. Bei Subdomainbetrieb alle oben genannten Portal-URLs auf `https://portal.nexusnetwork.pro` ändern.

E-Mail-Provider aktivieren, **Confirm email aktivieren**, sichere E-Mail-Änderung mit Bestätigung aktiv lassen und Mindestpasswortlänge auf mindestens 12 setzen. Auth-Rate-Limits, Session-Laufzeiten und Missbrauchsschutz konfigurieren. Für öffentliche Registrierung vor Launch einen angemessenen Spam-/CAPTCHA-Schutz am Auth-Dienst einrichten. Eigene SMTP-Zugangsdaten inkl. verifiziertem Absender konfigurieren; Default-SMTP ist kein produktiver E-Mail-Versandplan.

PKCE-Bestätigungslinks funktionieren über die Supabase ConfirmationURL und Redirect-Allowlist. Für geräteunabhängige E-Mail-Verifizierung können eigene Templates auf den unterstützten `token_hash`-Callback zeigen:

```text
Bestätigung: {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup
Recovery: {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery
E-Mail-Änderung: {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email_change
```

Templates zuerst auf Testinstanz prüfen. Bei neuen Free-Projekten kann Template-Anpassung mit Default-SMTP eingeschränkt sein; eigenes SMTP einrichten. Die Callback-Route erlaubt nur feste OTP-Typen und lokale Zielrouten. Bei Recovery folgt `/reset-password`. Nach Passwortänderung werden alle Sessions beendet.

## Google

1. Google Cloud Console → Projekt → Google Auth Platform/OAuth-Konfiguration. Consent Screen, Appname, Support-/Entwickleradresse und Testnutzer einrichten.
2. OAuth-Client vom Typ **Web application** erstellen.
3. Authorized JavaScript Origin: der tatsächliche Portal-Origin; geplante Domain `https://nexusnetwork.pro` bzw. Portal-Subdomain. Domainbesitz für Consent/Branding bestätigen.
4. Authorized Redirect URI ist **nicht** die Next.js-Route, sondern `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`. Bei eigener Supabase-Auth-Domain deren Callback verwenden.
5. Client ID und Client Secret in Supabase → Authentication → Sign In / Providers → Google eintragen, Provider aktivieren.
6. Supabase-App-Redirect-Allowlist wie oben setzen. Erst nach erfolgreichem Test `AUTH_GOOGLE_ENABLED=true` setzen.

Die Google-Secrets gehören ausschließlich in die Providerkonfiguration, nicht ins Frontend. E-Mail-Login ist unabhängig von diesem Provider.

## Apple

1. Apple Developer-Mitgliedschaft; App ID mit Sign in with Apple konfigurieren.
2. Services ID für die Webanmeldung erstellen und mit der App ID verbinden. Services ID dient als Client-ID.
3. Webdomain `nexusnetwork.pro` bzw. die tatsächliche Portal-Subdomain konfigurieren; Apple-Vorgaben zur Domainverifizierung erfüllen.
4. Return URL: `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback` (oder verifizierte eigene Auth-Domain).
5. Sign-in-with-Apple-Key erstellen; Team ID, Key ID und privates `.p8`-Material sicher aufbewahren. Daraus den Apple-Client-Secret-JWT nach Apple/Supabase-Dokumentation erstellen und den Provider in Supabase konfigurieren.
6. Client-Secret-Ablauf überwachen und rechtzeitig erneuern (Apple-Web-Client-Secrets maximal sechs Monate). `.p8` niemals ins Repository kopieren.
7. Erst nach funktionierendem Test `AUTH_APPLE_ENABLED=true`. Fehlende Namen nach Apple-OAuth werden im Onboarding ergänzt.

## Verwendete Primärdokumentation

- [SSR-Clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [PKCE, Cookies und Caches](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Apple Sign In](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [Supabase Changelog](https://supabase.com/changelog)

Provider-Login, echter Mailversand, Passwort-Recovery und Logout gegen eine laufende Auth-Instanz sind vor Produktionsfreigabe noch auszuführen.
