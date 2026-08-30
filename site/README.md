# Nexus Network Website

## Lokal starten

Node.js 22 oder neuer verwenden, dann `npm install` und `npm run dev`. Der statische Produktionsstand wird mit `npm run build` im Ordner `out/` erzeugt. Dieser Ordner enthält ausschließlich statische Dateien und kann direkt von GitHub Pages ausgeliefert werden.

## Konfiguration

Unternehmensdaten werden zentral in `app/company.ts` gepflegt. Vor dem Launch alle eckigen Platzhalter ersetzen. `.env.example` nach `.env.local` kopieren und Website-URL sowie `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` setzen.

GitHub Pages führt keinen Servercode aus. Das Formular sendet daher per HTTPS an einen später auszuwählenden Formular-Dienst, der serverseitige Validierung, Spam-Schutz, Rate-Limiting und E-Mail-Zustellung übernimmt. Ohne konfigurierten Endpunkt zeigt die Website einen Hinweis und verweist auf die direkte E-Mail-Adresse.

## GitHub Pages

Das Repository kann über eine GitHub-Actions-Workflow-Datei gebaut und der Inhalt von `out/` als Pages-Artefakt veröffentlicht werden. Bei Nutzung einer eigenen Domain wird die Domain in GitHub unter **Settings → Pages → Custom domain** hinterlegt. `NEXT_PUBLIC_SITE_URL` muss anschließend auf diese Domain zeigen, damit Canonicals, Sitemap und Social-Metadaten korrekt sind.

## Google Search Console

1. Website als Domain-Property anlegen und per DNS bestätigen.
2. Nach dem Deployment `https://IHRE-DOMAIN/sitemap.xml` unter **Sitemaps** einreichen.
3. Startseite und beide Zielgruppenseiten mit der URL-Prüfung testen.
4. Indexierungsbericht und Core Web Vitals regelmäßig kontrollieren.

## Vor dem Launch

Reale Unternehmensdaten, Datenschutzhinweise, Formularanbieter und Domain ergänzen und rechtlich prüfen. Erst danach den Ratgeber indexierbar schalten. Redirects für später geänderte URLs in `next.config.ts` zentral pflegen.
