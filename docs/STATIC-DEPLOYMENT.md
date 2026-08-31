# Statische Veröffentlichung — Nexus Network

## Architektur

Ein Next.js Static Export, ein Workspace `site`, ein Root-Artefakt `out/`. Keine dynamischen Routen und kein Produktions-Node-Server. Die lokale Vorschau ist nur ein Dateiserver.

`npm ci && npm run build` baut die Website. Der Root-Build erzeugt CSP-Hashes für Inline-Skripte, beschränkt Netzwerkzugriffe auf die eigene Origin und erzeugt `CNAME`/`.nojekyll`. Ein generischer Build-Scan prüft offensichtliche Zugangsdaten und CSP. Kein Scanner garantiert absolute Sicherheit. Die Meta-CSP kann nicht alle HTTP-Header ersetzen.

## GitHub Pages

Der Workflow prüft Dependencies, Quellcode, Formular, Build, Typen, Lint und statische Seiten. Anschließend wird nur `out/` hochgeladen und auf main veröffentlicht. **Push auf main oder ein manueller main-Workflow löst nach erfolgreichen Prüfungen die Veröffentlichung aus.** Domain- und DNS-Einstellungen werden nicht vom Workflow geändert.

Vor Freigabe:

1. Betreiberangaben und Datenschutz vervollständigen; Kontaktpostfächer prüfen.
2. Repository-Tarif und Hosting-Eignung prüfen; privates Repository nicht eigenmächtig öffentlich machen.
3. GitHub Settings → Pages → Source: GitHub Actions.
4. Custom domain: `nexusnetwork.pro` im Pages-Dashboard setzen und Domain verifizieren.
5. DNS anhand der aktuellen GitHub-Anleitung prüfen. Nur Web-Records anfassen; **MX, SPF, DKIM und andere Mail-Einträge erhalten**. Keine Wildcards.
6. Nach gültigem Zertifikat Enforce HTTPS aktivieren.
7. Öffentliche Direkt-URLs und 404 nach späterer Veröffentlichung erneut prüfen.

CNAME im Artefakt dokumentiert die beabsichtigte Domain, konfiguriert sie bei Actions-Publishing aber nicht. Es wird bewusst kein Repository-basePath verwendet: Ziel ist die eigene Domain, nicht `github.io/nexusnetwork/`.

Quellen: [Eigene Workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Custom Domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [Pages-Verfügbarkeit](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages), [Nutzungsgrenzen](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Betrieb

Öffentliche URLs: `/`, `/finanzberater-anbindung/`, `/finanzanlagenvermittler/`, `/impressum/`, `/datenschutz/`, `/ratgeber/`.
Der Ratgeber bleibt bis zu echten Beiträgen noindex. Unbekannte Pfade liefern eine echte 404, kein SPA-Fallback.

Keine Build-Secrets erforderlich. Optional `NEXT_PUBLIC_SITE_URL` in Root-`.env.local` für andere Origins. Die produktive Domain steht im Workflow fest.
Nur reguläre Commits/Reverts verwenden. Keine History-Rewrites. Alte nicht benötigte Repository-Variablen kann der Betreiber später separat aufräumen; lokal wird darauf nicht mehr zugegriffen.
