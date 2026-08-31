# NexusNetwork

NexusNetwork ist eine öffentliche Unternehmenswebsite für die Präsentation von NexusNetwork und die Ansprache von Finanzanlagevermittlern und potenziellen Kooperationspartnern.

Produktionsdomain: [nexusnetwork.pro](https://nexusnetwork.pro).

## Inhalte und Gestaltung

- Startseite mit Unternehmens- und Leistungsinformationen
- Informationen zur Anbindung und Zusammenarbeit
- Kontaktmöglichkeiten und validierter E-Mail-Entwurf
- Impressum und Datenschutz
- SEO-optimierte öffentliche Informationsseiten
- Responsive Gestaltung mit aktueller Markenidentität
- Interaktive Netzwerk-, Maus- und Scroll-Animationen; Berücksichtigung reduzierter Bewegung

## Technik und Projektstruktur

Next.js 16.3.3 und React 19.2.6, statischer Export. Die veröffentlichte Website benötigt keinen Anwendungsserver.

```text
site/
  app/                 Öffentliche Seiten, Kontakt, Layout, Animation und Metadaten
  public/              Aktuelles Logo, Social-Vorschaubild und statische Assets
scripts/               Build, lokale Vorschau, SEO-Snapshot und allgemeine Sicherheitsprüfungen
tests/                 Kontakt- und Website-Regressionstests mit SEO-Baseline
docs/                  Website-, Kontakt- und Deployment-Dokumentation
.github/workflows/     GitHub-Pages-Workflow
out/                   Generiertes Veröffentlichungsartefakt (nicht versioniert)
```

## Lokale Entwicklung

Node.js 24 empfohlen, mindestens 22.13. Befehle im Repository-Stamm:

```sh
npm ci
npm run dev
```

Entwicklungsserver: [localhost:3000](http://localhost:3000). `npm run dev:site` ist ein gleichwertiger Einstieg.
`npm ci` installiert die festgelegten Versionen aus package-lock.json; `npm install` nur bei beabsichtigten Änderungen der Abhängigkeiten verwenden.

## Statischer Build und Vorschau

```sh
npm run build
npm run preview
```

Vorschau: [127.0.0.1:4173](http://127.0.0.1:4173).
Ausschließlich Root-`out/` veröffentlichen: Der Root-Build ergänzt den Export aus `site/out/` um CSP-Metatags, `CNAME` und `.nojekyll` und prüft das Ergebnis. Der Preview-Server ist nur ein lokaler Dateiserver.

## Prüfungen

```sh
npm run typecheck
npm run lint
npm test
npm run test:static
npm run security:source
npm run security:build
npm audit
```

Typecheck und statische Tests nach dem Build ausführen. Die Tests prüfen unter anderem Kontaktvalidierung, Seiten, Assets, interne Links, Metadaten und 404-Verhalten.

## Konfiguration

`NEXT_PUBLIC_SITE_URL` ist optional und hat den Standardwert `https://nexusnetwork.pro`.
Der Root-Build liest die ignorierte Root-`.env.local`; für eigenständige Entwicklung kann `site/.env.local` verwendet werden. Die jeweiligen `.env.example`-Dateien sind Vorlagen. Keine Zugangsdaten werden für den Build benötigt.

## Deployment

`.github/workflows/deploy-pages.yml` prüft und baut die öffentliche Website bei Push auf `main` oder manuellem Start. Auf `main` wird Root-`out/` über GitHub Actions auf GitHub Pages veröffentlicht.

Ziel ist die eigene Domain **nexusnetwork.pro**, ohne Repository-Unterpfad. Die Domain muss zusätzlich in den Pages-Einstellungen und im DNS eingerichtet sein; die erzeugte CNAME-Datei ersetzt diese Einrichtung nicht. Details in der [Deployment-Anleitung](docs/STATIC-DEPLOYMENT.md).

## Kontakt

- Allgemeiner Kontakt: [hello@nexusnetwork.pro](mailto:hello@nexusnetwork.pro)
- Anbindung: [anbindung@nexusnetwork.pro](mailto:anbindung@nexusnetwork.pro)
- Kooperation: [kooperation@nexusnetwork.pro](mailto:kooperation@nexusnetwork.pro)
- Fragen: [frage@nexusnetwork.pro](mailto:frage@nexusnetwork.pro)

Das Kontaktformular validiert die Eingaben und erstellt **ausschließlich einen E-Mail-Entwurf**. Ein gesonderter Link öffnet das eigene E-Mail-Programm; erst dort wird die Nachricht versendet. Es gibt keinen serverseitigen Direktversand und keine Speicherung der Formulareingaben auf der Website. Ohne JavaScript bleiben direkte E-Mail-Links nutzbar. Postfächer bzw. Weiterleitungen müssen vom Betreiber eingerichtet sein.

Siehe [Kontaktprozess und optionaler externer Versanddienst](docs/CONTACT-FORM.md).

## SEO

Individuelle Page Titles und Meta Descriptions, eigene Canonical URLs, Sitemap, robots.txt, semantische Überschriften, Organization-JSON-LD sowie Open-Graph- und Twitter-Metadaten sind vorhanden. Fünf öffentliche Seiten sind indexierbar. Der noch im Aufbau befindliche Ratgeber bleibt bis zu fachlich geprüften Beiträgen noindex/follow.

## Betreiberhinweise und Dokumentation

Unternehmensangaben in `site/app/company.ts` enthalten noch zu ergänzende Platzhalter. Betreiberangaben, Hostingdaten und Rechtstexte müssen vor dem produktiven Einsatz vervollständigt und geprüft werden. Die Existenz der Kontaktadressen allein bestätigt noch keine Zustellbarkeit.

- [Statisches Deployment](docs/STATIC-DEPLOYMENT.md)
- [Kontaktprozess](docs/CONTACT-FORM.md)
- [Technische Rückbauhistorie und SEO-Vergleich](docs/WEBSITE-ROLLBACK.md)
