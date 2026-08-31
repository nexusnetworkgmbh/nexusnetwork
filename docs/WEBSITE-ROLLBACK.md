# Selektiver Rückbau – technische Historie

Historischer Ausgangspunkt: `55f178fef61262f75a190de27cc77a76051a4562` auf `main`. Selektiver Rückbau ohne Reset oder Eingriff in externe Datenbanken. Aktuelle Betriebsanweisungen stehen in der README und Deployment-Dokumentation.

## Bestandsmatrix (vor Implementierung festgelegt)

| Bereich | Entscheidung | Begründung |
| --- | --- | --- |
| site/app: öffentliche Seiten, Inhalte, CSS, Netzwerkanimation | KEEP | Eigenständige öffentliche Next.js-App; keine Imports aus portal |
| site/public/nexus-brand.png und og.png | KEEP | Aktuelles Logo, Favicon und Social-Vorschaubild |
| site/public: ältere, unreferenzierte Logos/favicon.svg | REVIEW → aus öffentlichem Export nehmen | Keine Laufzeitverwendung; Originale bleiben in Git-Historie verfügbar |
| portal: alle Routen, Komponenten, libs, Tests und Konfiguration | REMOVE | Ausschließlich Benutzerkonten, Verwaltung und Authentifizierung |
| portal/supabase: beide Migrationen | REMOVE | Ausschließlich entfernte Datenbankfunktionen; keine Remote-Ausführung |
| portal/public/nexus-brand.png | REMOVE | Byte-identische Kopie des erhaltenen Website-Logos (SHA256 3890e72dbf62e03386b0e3567430048cf11989b4c46ae77a6d02fec308d63855) |
| Root-Pakete/Lockfile | REVIEW → bereinigen | Ein Workspace site genügt; Next/React/TypeScript/ESLint/Tailwind weiter nötig |
| Build/Preview/Pages | REVIEW → vereinfachen | Statischer Export bleibt; Zusammenführung zweier Apps, Spezial-Assets und Freigabegate entfallen |
| Allgemeine CSP- und Credential-Prüfung | KEEP, vereinfachen | Weiter sinnvoll unabhängig von Benutzerkonten; keine alten Test-Allowlists |
| Portal-Security-, API-, RLS-Tests | REMOVE | Kein entsprechendes System mehr vorhanden |
| Öffentliche Tests | REVIEW → ersetzen/erweitern | Links, SEO, Assets, Formular, 404 und entfernte Routen prüfen |
| Kontaktformular | KEEP, reparieren | Bestehendes Layout, validierter E-Mail-Entwurf als ehrlicher statischer Fallback |
| Navigation/CTA | REVIEW → Kontakt + mobiles Menü | Nur Konto-Link entfernen; zuvor unter 900 px versteckte Navigation zugänglich machen |
| SEO | KEEP, gezielte Fehlerkorrektur | Titles/Descriptions/H1 erhalten; eigene Canonicals statt geerbter Startseite; keine Platzhalter im Schema |
| Impressum/Datenschutz | KEEP | Keine kontobezogenen Verarbeitungstexte; reale Betreiberangaben weiterhin erforderlich |
| Alte Migrations-/Sicherheits-/Produktionsanleitungen | REMOVE | Beschreiben nur entfallene Architektur; durch Website-Dokumentation ersetzen |
| .local-history, externe Datenbanken, Git-Historie | KEEP | Nicht Teil des veröffentlichten Produkts; keine Datenvernichtung |

## Historienprüfung

`git diff 4321ff2..55f178f -- site/app site/next.config.ts` zeigt im öffentlichen App-Code nur den Umstieg der URL-Variable, den deaktivierten Formular-Endpunkt und das Login-Linkziel. Aktuelles Design, Netzwerk, Logo und responsive Kartenanordnung werden deshalb nicht auf einen älteren Stand zurückgesetzt. Der frühere Website-Stand wurde zusätzlich über die lokale Git-Sicherung geprüft.

SEO-Messwerte vor dem Umbau werden in `tests/fixtures/seo-before.json` festgehalten. Der Abschlussbericht ergänzt Testergebnisse, SEO-Veränderungen und offene Betreiberaufgaben.

## Abschlussbericht (31.08.2026)

### A. Entfernt

Login, Registrierung, Passwort-Reset, OAuth-Callback, Sessions/Guards, Partnerportal mit Kunden/Vermittlungen/Aufgaben/Profil/Einstellungen, Onboarding, Admin/Freigaben/Rollen, Supabase-Clients und CLI, beide Datenbankmigrationen, RLS/RPC/Trigger, Datenbank- und API-Securitytests. Der zweite Next-Export, separate Portal-Assets und das datenbankabhängige Pages-Freigabegate entfallen. Kein externer Dienst wurde verändert.

### B. Bewahrt

Aktuelles weißes Logo im goldenen Rahmen, Favicon, Social-Vorschaubild, Dark/Gold-Farbwelt, Desktop-Typografie, Hero, Netzwerkpunkte und Verbindungen, normale Mausinteraktion, Scroll-/Hover-/Reveal-Effekte, vier Zusammenarbeit-Schritte, Vorteilskarten, Zielgruppen, FAQ, Landingpages, Rechtstexte und Footer. Aktuelles Logo byte-identisch per SHA256 getestet. Keine hochwertigen Texte gekürzt; kein neuer Finanz-/Erfolgsclaim.

Gezielte UI-Korrekturen: Kontakt-CTA statt Konto-Symbol; mobiles Menü mit Escape und Schließen nach Linkwahl; kompakter Kontakttext auf Smartphones; lange Unterseiten-Überschriften umbrechen; bei sehr kleinen Displays bis 380 px passende Hero-Schriftgröße und einspaltige Vertrauensmerkmale, damit nichts abgeschnitten wird. Desktopgestaltung bleibt unverändert.

Animation: Anzahl/Anordnung/Farben der Punkte und Linien, Mausglättung und DPR-Limit unverändert. Reduced Motion friert das Netzwerk ein, deaktiviert Parallax und CSS-Animationen; bei normaler Einstellung bleibt die Animation aktiv. Offscreen-/Tab-Pausen bleiben erhalten.

### C. Dateien

81 versionierte Dateien entfernt, 28 bestehende Dateien bearbeitet. Neue Dateien enthalten die Kontaktvalidierung, das mobile Menü, öffentliche Tests, SEO-Snapshots und Dokumentation. Die vollständige Einzeldateiliste ist über den Git-Diff des Rückbau-Commits nachvollziehbar.

Unreferenzierte alte Logo-/Favicon-Dateien aus dem öffentlichen Assetordner entfernt, nicht das aktuelle Logo. Lokale Sicherungen sind nicht Teil des Repositories oder Veröffentlichungsartefakts. Frühere versionierte Inhalte bleiben über die Ausgangsrevision wiederherstellbar. Keine Git-Historie gelöscht.

### D. Dependencies

Direkt entfernt: `@supabase/supabase-js` 2.112.4, `supabase` 2.116.0, `@electric-sql/pglite` 0.5.8; dazu ausschließlich benötigte transitive Bibliotheken und Workspace-Verknüpfung. 26 Lockfile-Pfade entfallen.

Beibehalten: Next 16.3.3, React/React DOM 19.2.6, TypeScript 5.9.3, ESLint 9.39.4 + eslint-config-next 16.3.3, Tailwind/PostCSS 4.2.1 und Node-/React-Typen. Keine neue Laufzeit-Abhängigkeit.

`npm ci`: 438 Pakete installiert, 446 auditiert, 0 gemeldete Schwachstellen. ESLint 9.39.4 meldet eine Upstream-Support-/Deprecation-Warnung; ein Major-Upgrade ist eine separate Wartungsaufgabe, kein unterdrückter Testfehler.

### E. Build und automatisierte Prüfung

| Prüfung | Ergebnis |
| --- | --- |
| npm ci (nach endgültiger Lockfile-Bereinigung) | erfolgreich |
| npm run build | erfolgreich, nur öffentliche statische Routen |
| npm run typecheck | erfolgreich |
| npm run lint | erfolgreich |
| npm test | 18/18 Kontakt-Tests |
| npm run test:static | 18/18 Seiten-/SEO-/Asset-/CSP-Tests |
| npm run security:source | keine potenziellen Secrets gefunden |
| npm run security:build | 55 Dateien, keine Befunde |
| npm audit --audit-level=high | 0 Schwachstellen |
| git diff --check | keine Whitespace-Fehler |

HTTP lokal: Homepage, fünf Unterseiten, robots.txt, sitemap.xml und Logo jeweils 200. Alte Login-/Register-/Reset-/Callback-/Portal-/Admin-Pfade und unbekannte URL jeweils 404 mit eigener Fehlerseite; kein Redirect zum Login und kein SPA-Catch-all. Es wurde kein Produktionsdeployment gestartet.

### F. Browserprüfung

Tatsächlicher In-app-Browser über den Browser-Skill, gebautes Root-Artefakt unter http://127.0.0.1:4173/:

- Desktop 1440 × 1000: Hero/Logo/Netzwerk sichtbar; Mausbewegung ohne Laufzeitfehler; Navigation, Kontaktanker (ca. 108 px unter Oberkante), Legal-Links und Footer geprüft.
- Schmaler Desktop 1000 × 850: vier Schritte sauber in zwei Spalten, gleiche Zeilenpositionen; Menü öffnet/schließt und Linknavigation funktioniert.
- Smartphone 390 × 844 und 320 × 740: sichtbare Kontakt-CTA, funktionsfähiges Menü, keine abgeschnittene Hero-Überschrift; Unterseitenumbrüche nachgebessert. Geprüfte Dokumente ohne horizontalen Überlauf nach Korrektur.
- Menü per Escape geschlossen, Fokus auf Summary. Anchor-Klick schließt Menü.
- Pflichtfeldprüfung und vollständig ausgefüllter lokaler E-Mail-Entwurf getestet. Kooperation führt zu kooperation@nexusnetwork.pro. Entwurf-Link nicht geöffnet; **keine Nachricht gesendet**.
- Alle öffentlichen Unterseiten direkt geladen, Impressum zusätzlich neu geladen. Datenschutz über Link zurück zur Startseite geprüft.
- Header- und Footer-Logo vollständig geladen; Footerbild wird weiterhin lazy geladen.
- Keine Error-/Warning-Logs auf gültigen öffentlichen Seiten. Für absichtlich aufgerufene Fehler-URLs ist HTTP 404 erwartetes Verhalten, kein Anwendungsfehler.

Reduced Motion wurde im Code geprüft; keine Betriebssystemeinstellung verändert. Kein belastbarer Geräte-FPS-, Lighthouse- oder Feld-Core-Web-Vitals-Nachweis behauptet.

### G. SEO: BEFORE / AFTER

Gesicherte Baseline: [SEO-Regressionsfixture](../tests/fixtures/seo-before.json). Nachher-Werte sind unten dokumentiert und nach einem Build mit `node scripts/seo-snapshot.mjs` reproduzierbar; generierte Ausgaben werden nicht versioniert.
Die 18 statischen Tests vergleichen Title, Description, H1 und Robots jeder öffentlichen Seite gegen den Vorher-Snapshot.

| Merkmal | BEFORE | AFTER / Bewertung |
| --- | --- | --- |
| Öffentliche Seiten | 6 | 6, unverändert |
| Indexierbar laut Robots-Meta | 5 | 5, unverändert; Ratgeber bleibt noindex/follow |
| Title, Description, H1 | Bestehende sechs Seitentexte | auf allen sechs Seiten exakt gleich |
| H2/H3 und Informationsinhalt | Schritte, Leistungen, FAQ, Landing-/Rechtstexte | unverändert; Kontaktadressen/Hinweis ergänzt |
| Canonical Startseite | https://nexusnetwork.pro/ | unverändert |
| Canonical der fünf Unterseiten | fälschlich jeweils Startseite geerbt | jeweils eigener Pfad mit Slash; beabsichtigte Fehlerkorrektur |
| robots.txt | Allow /, Disallow /api/, Host/Sitemap | Allow /, gleicher Host/Sitemap; obsolete API-Sperre entfernt |
| sitemap.xml | 5 Pfade ohne abschließenden Slash; lastmod bei jedem Build neu | gleiche 5 Pfade mit Slash; irreführenden Build-lastmod entfernt, Prioritäten/Frequenzen gleich |
| JSON-LD | Organization mit erfunden wirkenden Platzhalter-Adresse/Telefon/E-Mail | Organization bleibt; echte hello-Adresse + aktuelles Logo, nicht bestätigte legalName/Telefon/Adresse weggelassen |
| WebSite/Breadcrumb/FAQ-Schema | nicht vorhanden | weiterhin nicht vorhanden; nichts entfernt |
| Open Graph/Twitter | Titel, Beschreibungen, og.png | unverändert |
| Bild-Alt-Texte/Größen | dekoratives Logo, benannter Markenlink, feste Maße | unverändert; Assettest bestanden |
| Gerenderte Links gesamt | 22 | 32, inkl. mobiler Navigation und Kontaktadressen |
| Interne Linkvorkommen | 21 | 26; keine Konto-Verweise mehr |
| Ungültige Kontaktadresse | mailto:[E-MAIL-ADRESSE] | entfernt, vier korrekte Zieladressen plus Legal-Maillinks |
| Broken Links | kein vollständiger automatisierter Baseline-Linktest; ungültiger Mailto bekannt | 0 fehlende lokale Link-/Asset-/Ankerziele im statischen Test |
| Fehlerseiten | eigene Next-404 im Export, lokaler Server bisher Plaintext | eigene 404 auch im lokalen Server mit echtem HTTP404; noindex bleibt |

Sämtliche beabsichtigten SEO-Änderungen sind oben benannt. Kein Textverlust, keine neue Indexsperre und keine unbeabsichtigte Canonical-Umleitung. Suchmaschinenranking oder reale Indexierung werden nicht garantiert.

#### Exakte Seitentexte (BEFORE = AFTER)

- **/**
  - Title: Nexus Network | Professionelle Anbindung für Finanzberater
  - Description: Nexus Network verbindet selbstständige Finanzberater und Finanzanlagenvermittler mit einer professionellen, partnerschaftlichen Struktur.
  - H1: Die Verbindung zwischen Finanzfachkräften und Möglichkeiten.
- **/finanzberater-anbindung/**
  - Title: Finanzberater-Anbindung | Nexus Network
  - Description: Professionelle Anbindung für selbstständige Finanzberater: Voraussetzungen, Ablauf und Zusammenarbeit mit Nexus Network.
  - H1: Eine professionelle Anbindung für Ihre Finanzberatung.
- **/finanzanlagenvermittler/**
  - Title: Zusammenarbeit für Finanzanlagenvermittler | Nexus Network
  - Description: Informationen für Finanzanlagenvermittler, die eine professionelle Vermittlungsstruktur und partnerschaftliche Zusammenarbeit suchen.
  - H1: Zusammenarbeit mit Struktur und klaren Ansprechpartnern.
- **/impressum/**
  - Title: Impressum | Nexus Network
  - Description: Anbieterkennzeichnung und rechtliche Angaben zu Nexus Network.
  - H1: Impressum
- **/datenschutz/**
  - Title: Datenschutz | Nexus Network
  - Description: Informationen zur Verarbeitung personenbezogener Daten bei Nexus Network.
  - H1: Datenschutzerklärung
- **/ratgeber/**
  - Title: Ratgeber für Finanzberater | Nexus Network
  - Description: Künftige Fachbeiträge zu Anbindung, Zusammenarbeit und unternehmerischen Fragen für Finanzanlagefachkräfte.
  - H1: Ratgeber für Finanzanlagefachkräfte.

#### Performance

| Gesamter unkomprimierter Export | BEFORE | AFTER |
| --- | ---: | ---: |
| Dateien | 212 | 55 |
| Bytes | 5741913 | 3098060 |
| JavaScript-Bytes | 2146861 | 1121974 |

Export insgesamt ca. 46.0 % kleiner, enthaltenes JavaScript ca. 47.7 % weniger. **Das ist kein Vergleich der Homepage-Ladezeit:** die alte Summe enthielt die komplette zweite Anwendung sowie unbenutzte Assets. Keine neuen Webfonts/Tracker/externen Laufzeitdienste. Das erhaltene Social-Bild wird nicht im Hero geladen. Tatsächliche LCP/INP/CLS-Feldwerte müssen nach einer späteren Veröffentlichung gemessen werden.

### H. Restreferenzen / Dead Code

Aktiver App-/Build-/Workflow-Code enthält keine Login-, Auth-, Portal- oder Supabase-Integration. Bewertete Treffer:

- `register/registerNumber` im Unternehmensobjekt und Impressum = Handelsregister, keine Registrierung.
- `Organization` in JSON-LD = öffentliche Unternehmensdaten, kein Mandantenmodell.
- `autoComplete="organization"` = standardisiertes Formularattribut.
- Begriffe in Tests = explizite Negativtests, die Wiederauftauchen entfernter Routen/Pakete verhindern.
- Vorher-Snapshot und dieser Bericht = historische Dokumentation; werden nicht ausgeliefert.
- Git-Historie/ignorierte lokale Sicherung = bewusst erhalten, nicht aktiver Code.
- Generische Prüfungen auf Zugangsdaten und deren Bibliotheksbegriffe sind keine Authentifizierung.

Im aktuellen Lockfile keine Supabase-/PGlite-/Portal-Pakete. Alte Branding-Assets nur noch in lokaler Sicherung/Git-Historie.

### I. Offene Betreiberaufgaben

1. Impressum-Daten in `site/app/company.ts` ergänzen (Rechtsform, Anschrift, Vertretung, Register, USt-ID, Telefonnummer soweit zutreffend); rechtlich prüfen lassen. Nichts davon wurde erfunden.
2. Datenschutz um tatsächliche Hostingdaten ergänzen und prüfen; keine konto-/datenbankbezogenen Passagen waren vorhanden. Bei späterem Formular-Dienst dessen Verarbeitung vor Aktivierung ergänzen.
3. Alle vier Mailadressen/Weiterleitungen einrichten und Empfang testen. Der aktuelle Entwurf ist ausdrücklich kein Direktversand.
4. Falls Direktversand gewünscht: separate, geprüfte Formularintegration gemäß [Kontaktanleitung](CONTACT-FORM.md), einschließlich Spam-Schutz, serverseitiger Validierung und Zustelltest.
5. Hosting-Tarif, Pages-Eignung, Domain/DNS/HTTPS nach [Deploymentanleitung](STATIC-DEPLOYMENT.md) prüfen. Für ein privates Repository ist Pages nicht ohne passenden Tarif verfügbar ([GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)).
6. Änderungen vor Veröffentlichung prüfen. Push auf main löst mit dem vereinfachten Workflow ein Deployment aus, sofern Pages eingerichtet ist.
7. Veraltete Remote-Konfiguration später separat aufräumen, falls gewünscht. Hier keine Secrets, Dienste, Datenbanken oder DNS-Einträge geändert.
8. Ratgeber erst mit fachlich geprüften Inhalten indexieren; ESLint-Major-Upgrade separat planen.

### Nachvollziehbarkeit

Dieser Bericht dokumentiert die lokale Abnahme des selektiven Rückbaus am 31.08.2026, nicht den aktuellen Veröffentlichungsstatus. Ausgangsrevision: `55f178f`. Die vollständige Dateiänderung ist in der Git-Historie des Rückbau-Commits nachvollziehbar. Temporäre Git-Statusausgaben und generierte Nachher-Prüfdateien werden nicht versioniert. Die Vorher-Datei bleibt als gezielt verwendete SEO-Regressionsfixture erhalten.
