# Supabase einrichten und wirklich testen

**Kein NexusNetwork-Projekt ist derzeit verbunden.** Es wurden keine Remote-Migrationen angewendet. Zuerst ein isoliertes Testprojekt mit ausschließlich synthetischen Daten verwenden. Kein echtes Kundenmaterial hochladen.

## Schritte 1–10

### 1. Projekt erstellen

Supabase Dashboard → gewünschte eigene Organisation → New project → Name z. B. NexusNetwork Test, passende EU-Region. Tarif/Kosten und Datenverarbeitungsanforderungen selbst prüfen. Starkes Datenbankpasswort im Passwortmanager speichern, niemals im Frontend oder Git. URL/Projektname sind öffentlich. Test: Projektstatus betriebsbereit. Produktion später separat, nicht das einzige Testprojekt unbemerkt umwidmen.

### 2. Migrationen anwenden

Nur im neuen dedizierten Projekt über **SQL Editor** nacheinander den vollständigen Inhalt ausführen:

1. `portal/supabase/migrations/20260830022641_release_one.sql`
2. `portal/supabase/migrations/20260830145707_static_security.sql`

Die erste Migration ist für ein frisches Schema. Bei schon existierenden Tabellen **stoppen**, Migration History und Schema abgleichen, nicht Tabellen löschen oder mehrfach ausführen. Alternativ CLI aus `portal/` mit vorher geprüfter Projektverknüpfung benutzen; zuerst `npx supabase --help` und die jeweilige Unterbefehlhilfe lesen. Keine Datenbankpasswörter in Kommandozeilen/Chat kopieren.

Test: Table Editor zeigt zehn öffentliche Tabellen; jede mit RLS. `private` darf in **Data API → Exposed schemas** nicht enthalten sein. Öffentliche Wrapper sind invoker, privilegierte Implementierungen privat. Advisor im Dashboard prüfen; alle High/Critical-Befunde lösen. Zusätzlich `supabase db lint --linked --level warning --fail-on warning` nach expliziter Verknüpfungsprüfung. Die lokale Katalogprüfung ersetzt diesen echten Advisor nicht.

### 3. Publishable Key

Project Settings → API Keys → **Publishable key**, beginnt mit `sb_publishable_`. Dieser Wert darf ins Frontend. Keinen Secret Key, Legacy-Service-Key oder DB-Zugang verwenden. Test: GitHub-Variable exakt gesetzt, Build akzeptiert den Schlüsseltyp, anonymer API-Aufruf kann keine Geschäftsdaten lesen.

### 4. Supabase URL

Projektansicht **Connect** bzw. Data API/API Settings → Project URL, Form `https://<project-ref>.supabase.co`. Öffentlich. URL und Key müssen zum selben Testprojekt gehören. Test: offizielle Auth-Einstellungen des Projekts erreichbar, keine gemischten Test-/Produktionswerte.

### 5. Auth konfigurieren

Authentication → Sign In / Providers: Email aktiv, Anonymous Sign-ins **aus**, Apple **aus**. E-Mail-Bestätigung einschalten. Passwortminimum mindestens 12, verfügbare Passwortschutzoptionen prüfen. Backend-Rate-Limits aktiv lassen und für kontrollierte Tests dokumentieren, nicht global abschalten. Authenticator-/MFA-Schutz für Dashboard-Betreiber einrichten.

CAPTCHA: Supabase unterstützt Turnstile/hCaptcha. Ein CAPTCHA-Secret gehört nur in Supabase. **Der aktuelle Client enthält noch kein CAPTCHA-Widget**. Aktivierung erfordert zuerst UI-Integration, Tokenübergabe bei Login/Signup/Reset und enge CSP-Erweiterung; sonst schlagen diese Flows fehl. Bis dahin keine offene öffentliche Registrierung freigeben. Test: wiederholte Versuche werden backendseitig begrenzt; Fehlermeldungen verraten keine Account-Existenz. [Offizielle CAPTCHA-Anleitung](https://supabase.com/docs/guides/auth/auth-captcha).

### 6. Site URL

Authentication → URL Configuration → Site URL für Produktion: `https://nexusnetwork.pro`. Für das isolierte lokale Testprojekt: `http://127.0.0.1:4175` (oder der tatsächlich verwendete Preview-Port). Der lokale Root-Build benötigt denselben NEXT_PUBLIC_APP_URL-Wert. Öffentlich. Test: E-Mail-Links zeigen auf das richtige Frontend, nicht auf eine alte localhost-/Sites-Adresse.

### 7. Redirect URLs

Exakt erlauben, keine pauschalen Wildcards:

- `https://nexusnetwork.pro/auth/callback`
- `https://nexusnetwork.pro/auth/callback/`
- `https://nexusnetwork.pro/auth/callback/?next=/reset-password`
- `https://nexusnetwork.pro/auth/callback?next=/reset-password`

Im Testprojekt dieselben Pfade mit `http://127.0.0.1:4175`; nicht unnötig localhost in Produktion erlauben. App-Callback und Supabase-Provider-Callback sind verschiedene URLs. Test: erlaubtes Ziel funktioniert, fremde Redirect-Domain wird abgewiesen.

### 8. E-Mail-Verifikation und Reset

Confirm email aktiviert lassen. Standard-PKCE-E-Mails funktionieren im Browser, der den Vorgang begonnen hat. Wird ein Link auf einem anderen Gerät geöffnet, fehlt der lokale Verifier. Für browserübergreifende E-Mail-Flows kann im jeweiligen Supabase-E-Mail-Template ein Token-Hash-Link verwendet werden; der Callback unterstützt ausschließlich signup, recovery, email_change:

```html
<a href="{{ .SiteURL }}/auth/callback/?token_hash={{ .TokenHash }}&type=signup">E-Mail bestätigen</a>
```

Im Reset-Template `type=recovery`, im E-Mail-Änderungstemplate `type=email_change`. Templates pro Flow getrennt prüfen; sichere E-Mail-Änderung mit Bestätigung alter/neuer Adresse aktiv lassen. TokenHash ist **vertraulich und einmalig**, nie protokollieren oder als Beispielwert speichern. Callback entfernt Parameter sofort; Reset meldet nach Änderung global ab.

Test: Registrierung vor Bestätigung hat keinen Business-Zugriff; bestätigter Partner bleibt pending. Abgelaufener/wiederverwendeter Link schlägt sicher fehl. Reset in gleichem und anderem Browser testen; altes Passwort darf danach nicht mehr funktionieren. [PKCE-Dokumentation](https://supabase.com/docs/guides/auth/sessions/pkce-flow).

### 9. SMTP

Authentication → Email → SMTP Settings: eigenen geeigneten Anbieter, verifizierte Absenderdomain, tatsächlichen Host/Port/TLS, Benutzername und Passwort des Anbieters eintragen. **Keine erfundenen Werte**. SMTP-Zugang ist geheim und bleibt in Supabase. Absenderadresse darf öffentlich sein. DNS-SPF/DKIM/DMARC nach Anbieterangaben einrichten. Supabase-Standardversand ist nicht als Produktions-Maildienst einzuplanen.

Test: Verifikation und Reset an externe Testpostfächer, Zustellung und Spamordner prüfen; keine Token in Screenshots. Fehler bei SMTP müssen ohne Freigabe des Accounts enden. [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

### 10. Google OAuth vorbereiten

Google Cloud → OAuth Client vom Typ Web application. Autorisierte JavaScript-Origin: `https://nexusnetwork.pro`; autorisierte Redirect URI: **der exakte Supabase-Callback aus dem Google-Provider-Dashboard**, üblicherweise `https://<project-ref>.supabase.co/auth/v1/callback`. Nicht mit dem App-Callback verwechseln. Consent Screen, Domainverifikation und Testnutzer konfigurieren.

Client-ID und Client-Secret ausschließlich im Supabase-Google-Provider hinterlegen; Secret niemals in GitHub-Build oder Browser. Nach erfolgreichem Test `googleOAuthEnabled` in `portal/lib/features.ts` auf true setzen und neu bauen. Apple bleibt entfernt. Test: Anmeldung kommt zur App zurück, DB-Status bleibt pending, keine Adminrolle aus Google-Metadaten. [Google/Supabase-Anleitung](https://supabase.com/docs/guides/auth/social-login/auth-google).

## 17. Ersten Admin sicher erstellen

Eigenes Betreiberkonto registrieren und E-Mail bestätigen. Seine UUID in Authentication → Users persönlich gegen die erwartete Adresse prüfen. Dann **einmalig im SQL Editor als Datenbankbetreiber**, nicht im Browser, ausführen (UUID ersetzen):

```sql
begin;
update public.profiles
set role = 'admin', status = 'active'
where user_id = '<VERIFIZIERTE-BETREIBER-UUID>'::uuid
returning user_id, role, status;
commit;
```

Erwartung: genau eine passende Zeile. UUID ist kein Geheimnis, die Befugnis des Dashboard-Kontos schon. Bei keiner/falscher Zeile abbrechen und prüfen. Das DB-Trigger-Audit protokolliert die Änderung; initialer Operator hat ggf. actor_id NULL, weil kein Endnutzer-JWT im SQL Editor vorliegt. Diese Initialmaßnahme separat im Betriebsprotokoll dokumentieren. Kein allgemeines Rollenänderungs-RPC für Partner erstellen. Test: eigener Adminbereich verfügbar, normaler Partner kann dieselbe Änderung nicht per API ausführen.

## 18. Testpartner

Drei separate synthetische Accounts: A, B und PENDING. Alle E-Mails bestätigen. A und B reichen vollständiges Onboarding ein und werden vom Admin aktiviert. Jeder erhält durch den DB-Trigger seine eigene Organisation. PENDING bleibt pending. Keine echten Kunden. Test: Statusübergänge pending → under_review → active; auch suspended und rejected testen. Ausgesperrte Nutzer dürfen direkt über REST keine Geschäftsdaten erhalten.

## 19. Direkte API-Isolationstests

Ignorierte Datei `portal/.env.test.local` ausschließlich lokal anlegen. Enthält öffentliche URL/Publishable Key sowie **geheime Testzugänge**:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SYNTHETIC_TEST_PROJECT=yes
TEST_A_EMAIL=
TEST_A_PASSWORD=
TEST_B_EMAIL=
TEST_B_PASSWORD=
TEST_PENDING_EMAIL=
TEST_PENDING_PASSWORD=
```

Im Repository-Stamm: `node --env-file=portal/.env.test.local portal/scripts/api-security.mjs`.

Das Skript nutzt direkte HTTP-Requests und ausschließlich normale Partner-JWTs. Es erstellt synthetische Fixtures, versucht die 20 beschriebenen Angriffe und meldet passed/failed ohne sensible Antwortinhalte. Es benötigt **keinen** Admin-/Service-Key. Erwartung: 20 passed, 0 failed. Bei Fehlkonfiguration kein PASS. Fixtures bleiben bewusst im isolierten Testprojekt; kein DELETE-Recht für Partner. Nach Prüfung das Testprojekt kontrolliert zurücksetzen/entsorgen, nicht Produktionsdaten.

Zusätzlich manuell im Browser Login, Logout, Session Restore, Password Reset, Registrierung, alle Statusseiten, Kunden, Deals, Notizen, Historie, Aufgaben, Dashboard, Profil, Admin testen. Netzwerkfehler, Sessionwiderruf, fremde UUID, manipulierte Rollen und veraltete Tokens ebenfalls testen. Echte Advisor-Ergebnisse, Browser-Abnahme und Tests dokumentieren. Erst danach Schritt 20 in STATIC-DEPLOYMENT.md erwägen.
