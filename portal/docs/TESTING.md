# Teststand und Abnahme

## Ausgeführte Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| Portal Production Build / TypeScript | Bestanden |
| Öffentliche Website Production Build | Bestanden, statischer Export bleibt erhalten |
| Portal ESLint | Bestanden ohne Warnungen |
| PostgreSQL/RLS + Validierung | 26/26 Tests bestanden, keine übersprungen |
| Lokale HTTP-Prüfung | 3 Authseiten erreichbar, 9 geschützte Routen gesperrt, Callback ohne Konfiguration sicher umgeleitet |
| Auth-Oberfläche Desktop/Mobil | Geprüft; keine erfassten Konsolenwarnungen/-fehler |
| Echte Supabase Auth / OAuth / geschützte Browser-Workflows | Noch offen, keine passende Instanz verbunden |

## Automatisiert ohne Credentials

`pnpm test` führt Tests mit echtem PostgreSQL in PGlite und reine Validierungstests aus. Die produktive Migration wird unverändert eingespielt. Die Tests legen minimal nachgebildete auth.users/auth.sessions an und setzen JWT-Claims für SQL-Rollen. **Das testet PostgreSQL/RLS, nicht Supabase Auth oder PostgREST.** Testdaten sind ausschließlich fiktiv und verbleiben im flüchtigen Testprozess.

Abgedeckt: alle Geschäftstabellen mit RLS, Metadaten-Manipulation, die fünf verlangten Isolationstests, Mandantenänderung, relationale Tenant-FKs, Admin-RPC, Rollen-/Mitgliedschaftsschutz, unveränderbares Audit/History, Kundenänderungen, Vermittlungsnummern und Volumensumme, Statushistorie, Notizenautor, Aufgabenrelation/-zuweisung/-abschluss, Onboarding, Adminfreigabe, Suspension, Session-Widerruf/-Ablauf, unbestätigte E-Mail, anonymer Zugriff, Formularvalidierung, Passwort-Whitespace, sichere Redirect-Ziele.

`node scripts/http-smoke.mjs` prüft gegen den **laufenden lokalen Server** öffentliche Auth-Routen, Security-/Cache-Header und anonyme Sperren für geschützte Routen. Erwartet eine unkonfigurierte oder nicht angemeldete Umgebung. Startserver vorher neu bauen.

## Browserprüfung dieses Arbeitsstands

- Auth-Oberfläche Desktop 1440 × 1000 und Smartphone 390 × 844 geprüft.
- Login ohne Backend: Einrichtungshinweis, keine aktive Fake-Anmeldung; Logo und Goldrahmen passen zum Design.
- Registrierungs-/Recovery-Navigation und Browserkonsole werden geprüft.
- Keine produktiven Kunden- oder Partnerdaten verwendet.

## Noch erforderliche Abnahme auf echter Testinstanz

Ein optionaler ausführbarer Auth-/PostgREST-Smoketest liegt unter `scripts/live-auth-smoke.mjs`. Nach Einrichtung einer **wegwerfbaren lokalen** Instanz und Eintragen ihrer drei Supabase-Variablen: `ALLOW_LOCAL_AUTH_TEST=yes` setzen und `node --env-file=.env.local scripts/live-auth-smoke.mjs` ausführen. Er lehnt Cloud-URLs ab, nutzt zufällige rein fiktive Konten und hinterlässt sie in der lokalen Testdatenbank. Er bestätigt E-Mail testweise über die Admin-API und ersetzt deshalb ausdrücklich keinen echten E-Mail-Link-/SMTP-Test. Er wurde mangels lokaler Auth-Instanz noch nicht ausgeführt.

Ein dediziertes lokales Supabase mit Docker oder ein ausdrücklich ausgewähltes Cloud-Testprojekt ist erforderlich. Derzeit fehlt diese Instanz; deshalb sind die folgenden Punkte **offen, nicht bestanden**:

1. E-Mail-Registrierung, Bestätigungs-E-Mail, Link genau einmal nutzbar, unbestätigter Login blockiert.
2. Login korrekt/falsch, generische Fehler, PKCE über gleiche Browser-Origin, OAuth Google/Apple.
3. Passwort vergessen, Mailzustellung, Recovery-Link, Passwortwechsel, ungültiger/abgelaufener Link.
4. Logout aller Sessions, Back-Navigation, direkter API-Aufruf mit altem JWT, Refresh-/Sessionablauf.
5. Pending → Onboarding → under_review, keine Geschäftsdaten; Freigabe durch Admin → active; Suspension/rejected sperren.
6. Zwei aktive Partner in getrennten Organisationen: fremde Customer-URL, Deal-UPDATE, TASK-Relation, organization_id-Manipulation über **PostgREST**; keine Daten und keine Existenzinformation.
7. Kunde erstellen/bearbeiten/suchen/sortieren/paginieren; Details und Notizen prüfen.
8. Vermittlung erstellen/bearbeiten, sämtliche Status, automatisch erzeugte Nummer/Timeline, Notizenautor prüfen.
9. Aufgabe mit Deal/Kunde verknüpfen, erledigen/wieder öffnen, Heute/Überfällig/Woche/Später, Dashboard-Zählungen prüfen.
10. Adminliste/Detail/Statuswechsel/Audit; Partner darf weder RPC noch Action aufrufen.
11. Dashboard, Listen, Details, Onboarding, Profil/Einstellungen mit tatsächlichen Testdaten bei 390/768/1024/1440 px prüfen; Tastatur, Labels, Focus, Konsole.
12. Supabase Security-/Performance-Advisors, SMTP, OAuth-Redirects, RLS-API und Produktionshost prüfen.

Release 1 darf erst nach Abschluss dieser Punkte als produktiv freigegeben bezeichnet werden. Es existiert absichtlich kein Testschalter, der Auth oder RLS in der Portal-App umgeht.
