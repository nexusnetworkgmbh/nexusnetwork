# Sicherheitsabnahme der statischen Architektur

## Urteil

**NOT READY FOR PRODUCTION**

Ein erfolgreicher statischer Build ist kein Nachweis für eine sicher konfigurierte Supabase-Instanz. Echte API-Angriffe, Browserflüsse mit echten Test-JWTs, SMTP, Google und produktionsbezogene Advisor-Ergebnisse sind noch nicht abgenommen. Zudem ist die Eignung von GitHub Pages für ein kommerzielles Finanzportal offen (siehe STATIC-DEPLOYMENT.md).

## Datenbankgrenze: alle zehn Tabellen

Alle folgenden Tabellen: RLS aktiviert, anon keine Grants, kein DELETE-Recht für authenticated. Tabellen-Owner/DB-Betreiber sind privilegiert und keine normalen App-Nutzer.

| Tabelle | SELECT authenticated | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | eigenes verifiziertes Profil; aktive Organisationskollegen; aktive Admins | nur Auth-Bootstrap | nur eigene first_name, last_name, phone; Spaltengrants + USING/WITH CHECK | nein |
| organizations | eigene Mitgliedschaft oder Admin | nur Bootstrap | nur autorisiertes Onboarding-RPC | nein |
| organization_members | eigene Organisation oder Admin | nur Bootstrap | nein | nein |
| partner_profiles | eigenes Profil oder Admin | nur Bootstrap | nur Onboarding-RPC | nein |
| customers | aktive eigene Organisation | WITH CHECK + Tenant-Trigger | USING/WITH CHECK + unveränderliche Eigentümerschaft | nein |
| deals | aktive eigene Organisation | wie customers; Sequenznummer serverseitig | wie customers; Nummer unveränderlich | nein |
| tasks | aktive eigene Organisation | wie customers; Tenant-FKs | wie customers; Completion-Zeit im Trigger | nein |
| deal_notes | aktive eigene Organisation | Tenant-FKs; Autor aus auth.uid | eigene aktive Organisation, Ownership unveränderlich | nein |
| deal_status_history | aktive eigene Organisation | nur Trigger | nein | nein |
| audit_logs | aktive eigene Organisation oder Admin | nur Trigger | nein | nein |

SELECT-Policies begrenzen Sichtbarkeit. INSERT verwendet WITH CHECK; UPDATE verwendet USING und WITH CHECK. Nicht erlaubte Operationen haben keine Policy/keinen Grant, nicht eine großzügige Standardregel. Historie und Audit werden auch für Admins nicht schreibbar. Geschäftsdaten anderer Organisationen werden Admins nicht pauschal freigegeben; Admin-Sicht betrifft Partnerprüfung/Audit.

## Privilegierte Funktionen

Alle SECURITY DEFINER-Funktionen liegen im nicht exponierten Schema private, setzen einen festen leeren search_path und verwenden qualifizierte Objekte:

- session_valid: auth.uid, bestätigte Auth-E-Mail, passende auth.sessions-ID und not_after. Benutzerlöschung/Widerruf/fehlende Session führt zu Ablehnung; reale Supabase-Session-Lifecycle-Eigenschaften müssen getestet werden.
- is_admin / member_of / can_work / peer: lesen geschützte DB-Rollen, Mitgliedschaft und Status; kein user_metadata-Vertrauen.
- bootstrap_user: nur Auth-Trigger, keine direkte Client-Ausführung. Legt pending/partner an; Namen sind begrenzte unvertrauenswürdige Profildaten, nie Berechtigungen.
- guard_business: aktive Mitgliedschaft; INSERT-Autor/Zeit serverseitig; bei UPDATE id/organization_id/created_by/created_at unveränderlich; atomare Nummern und konsistente Tasks.
- audit_business / audit_profile: nur Trigger, nicht client-callable; werden nach autorisierten Änderungen ausgeführt. Autor/Zeit aus DB-Kontext; keine Kundennamen oder Notizen in Audit-Metadaten.
- save_onboarding: verifizierte Session, gesperrter Profil-Datensatz, nur pending; max. 16 KiB JSON-Objekt, submit nicht NULL, Einwilligung/Pflichtfelder; feste Feldliste.
- review_partner: aktiver DB-Admin, keine Selbstfreigabe, nur Partner-Ziele; active erst nach eingereichtem Onboarding, Status nicht NULL/pending.

Exponierte Wrapper save_onboarding/review_partner sowie deal_volume/search_records sind SECURITY INVOKER. Suche begrenzt Seite/Textlänge und erlaubt nur feste Tabellen/Sortierspalten; SQL-Werte sind gebundene Parameter. Direkter Aufruf der privaten Implementierungen gewährt Partnern keine zusätzlichen Rechte. PUBLIC/anon haben kein EXECUTE. Triggerimplementierungen haben auch für authenticated kein direktes EXECUTE.

Es gibt keine exponierten Views, keine Storage-Buckets und keine Edge Functions. Dokumentupload bleibt außerhalb dieser Version. Neue Buckets dürfen später nur privat mit separater Policy-Abnahme eingeführt werden.

## Integrität

Composite Foreign Keys verbinden Organization und Customer/Deal/Assignee. Task-Trigger prüft zusätzlich, dass der verknüpfte Deal denselben Kunden hat. Status/Prio sind Enums, Geldbeträge begrenzt und nicht negativ/NaN, Textlängen begrenzt; Customer-E-Mails zusätzlich per DB-Constraint geprüft. Telefonnummern sind auf Länge begrenzt, nicht auf eine bestimmte internationale Schreibweise. Bestehende Daten werden bei neuen Constraints nicht still korrigiert: Bei Verletzung scheitert die Migration und muss geprüft werden.

Dealnummern stammen aus einer PostgreSQL-Sequenz. Lücken nach Rollbacks sind normal, keine Kollisionen durch Browser-Zufall. Historie und Audit entstehen in derselben Transaktion wie die Änderung.

## Browser, XSS und Cache

- Nur offizieller Supabase JS Client; PKCE, persistSession, autoRefreshToken. Standard-SDK-Storage enthält die Session, **keine zusätzlichen Rollen/Kundendaten** werden in localStorage abgelegt. Keine eigenen Cookies oder JWTs.
- Browser-Sessiondaten sind bei XSS erreichbar. Das ist ein wesentlicher Unterschied zur alten HTTP-only-Cookie-Architektur und kein verschwiegener Sicherheitsgewinn.
- Protected views starten neutral. Erst Live-Auth und RLS-lesbares Profil liefern Inhalte. Fehler verweigern Zugriff. Bei Logout werden Views entfernt; nach Fokuswechsel/periodisch wird die Berechtigung erneut geprüft, ohne laufende Formulare ständig zurückzusetzen.
- API-Daten nur zur Browserlaufzeit, no-store/referrerPolicy no-referrer. Keine Geschäftsdaten im statischen HTML, Repository, Analytics oder Error Tracking. Es gibt keinen Service Worker/Offline-Datencache.
- Zurück-/Vorwärts-Cache wird durch neutralen pagehide-State und erneute Prüfung beim pageshow behandelt. Bereits angezeigte Daten können von einem berechtigten Nutzer kopiert werden; das kann RLS nicht verhindern.
- Nutzertexte werden als React-Text gerendert, nicht als HTML. Kein eval/new Function im Anwendungscode. Einzige dangerouslySetInnerHTML-Stelle: statisches Organization-JSON-LD der öffentlichen Website, ohne Nutzerinhalt und mit escaped `<`. Kein Markdown-HTML-Renderer.
- Suche per POST-RPC, nicht als Name/E-Mail im URL-Querystring. UUIDs in Detail-URLs sind keine Autorisierung.
- Produktions-App protokolliert weder User/Session noch Datenbankfehlertexte. Generische Fehler statt PII. Supabase-/Provider-Betriebslogs und Aufbewahrung müssen Betreiber separat prüfen.

## CSP und GitHub-Pages-Grenzen

Root-Build fügt CSP **vor** weiteren Head-Inhalten ein. Inline-Next-Skripte erhalten SHA-256-Hashes; script-src erlaubt nur self und diese Hashes. Kein unsafe-eval, kein pauschales unsafe-inline für Scripts. connect-src erlaubt nur self und die konkret konfigurierte Supabase-Origin. Google-OAuth ist Top-Level-Navigation über Supabase, kein extern geladenes Google-Skript.

Styles benötigen derzeit unsafe-inline für bestehende React-/Animationsstyles. Das ist eine dokumentierte Einschränkung. Kein frame/worker/object, base-uri none, form-action self. Vor CAPTCHA-/Drittanbieterintegration muss CSP gezielt überarbeitet werden. Die CSP gilt für den **finalen Root-/out-Export**, nicht unverändert für next dev oder einzelne Unterprojekt-Outputs.

GitHub Pages erlaubt keine eigenen beliebigen Response-Header. Meta-CSP kann u. a. frame-ancestors und wirksame Reporting-Header nicht ersetzen; X-Frame-Options/Permissions-Policy/Cache-Control können so nicht zugesichert werden. Clickjacking-Schutz per Response-Header bleibt offen. Kein erfundener Header-Schutz. Ein geeignetes Hosting mit konfigurierbaren Headern ist für sensible Portalnutzung zu prüfen.

## Tests und verbleibende Grenzen

- Lokale PGlite-SQL-Tests führen beide Migrationen mit simulierten Auth-Tabellen und echten PostgreSQL-Rollen/RLS aus. Keine Supabase-REST-, Auth-Service- oder vollständige Netzwerk-Simulation.
- 20 direkte HTTP-Negativtests in portal/scripts/api-security.mjs sind ausführbar, benötigen aber das isolierte echte Projekt und drei vorbereitete Testpartner. Ohne diese Daten gelten sie als **nicht ausgeführt**, nicht als bestanden.
- Static-Tests prüfen existierende Dokumente/Assets/CSP/neutralen Zustand. Browser-Prüfung ohne Supabase kann nur Rendern, Routing und verweigerten Zugang belegen.
- Quellcode-/Build-Secret-Scans sind Musterprüfungen, keine Garantie zur Erkennung beliebiger unbekannter Geheimnisse. Öffentlicher Publishable Key ist kein Secret.
- Dependency-Audit wird im Workflow wiederholt. Next/eslint-config-next wurden wegen konkreter Audit-Befunde von 16.2.6 auf 16.3.3 aktualisiert; keine neue Hauptversion. ESLint 9 ist upstream nicht mehr unterstützt, ein künftiges Hauptversionsupdate muss gesondert getestet werden.

## Offene Risiken / Freigabecheckliste

- [ ] Hosting-Nutzungsbedingungen und privater GitHub-Tarif geklärt.
- [ ] Dediziertes Supabase-Testprojekt, beide Migrationen, Schema-/Grants-/Advisor-Abnahme.
- [ ] 20 echte API-Negativtests bestanden, alle Browser-Businessflows und Statuswechsel getestet.
- [ ] Registrierung/E-Mail-Verifikation/Reset/Session Restore/Widerruf/Logout mit echten Sessions getestet.
- [ ] SMTP, Domain, Redirects, sichere E-Mail-Änderung und Rate Limits bestätigt.
- [ ] CAPTCHA/Registrierungs-Abuse-Schutz implementiert und getestet vor öffentlicher Registrierung.
- [ ] Adminzugänge/MFA-Prozess, Erstadmin und Wiederherstellung organisatorisch abgesichert.
- [ ] XSS-/CSP-/Clickjacking-Restgrenzen für den konkreten Host akzeptiert oder behoben.
- [ ] Google separat getestet, falls aktiviert; Apple bleibt deaktiviert.
- [ ] Impressum/Datenschutz/Unternehmensdaten vervollständigt; Kontaktformular hat noch keinen freigegebenen Backend-Versand.
- [ ] Datenschutzbetrieb, Zugriffskonzept, Backup/Restore, Lösch-/Aufbewahrungsverfahren und Monitoring geklärt. R1 bietet bewusst kein Partner-DELETE und keinen Dokumentupload.
- [ ] Keine High/Critical-Dependency-/DB-Befunde offen; Scans des tatsächlich veröffentlichten Builds sauber.
- [ ] Betreiberfreigabe und passendes GitHub-Environment-Schutzverfahren dokumentiert.

Erst nach diesen Punkten kann **READY FOR CONTROLLED PRODUCTION TESTING** erwogen werden. Keine Aussage „100% sicher“.
