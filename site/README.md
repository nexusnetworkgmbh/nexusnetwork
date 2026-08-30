# Nexus Network — öffentliche Website

Statischer Next.js-Export. Design, Animationen und SEO-Seiten bleiben erhalten. Der Partnerzugang führt same-origin nach /login/.

Installation und Deployment-Build aus dem Repository-Stamm: `npm ci`, `npm run build`. Root-`out/` enthält Website **und** Portal. Nicht site/out allein veröffentlichen. Lokale Website-Entwicklung: `npm run dev:site`.

Öffentliche Domain-Konfiguration: NEXT_PUBLIC_APP_URL (Standard https://nexusnetwork.pro). Unternehmensdaten im Impressum/Datenschutz enthalten weiterhin Betreiber-Platzhalter. Das Kontaktformular hat bewusst keinen unbestätigten Versanddienst.

Siehe [Gesamtanleitung](../docs/STATIC-DEPLOYMENT.md). Der frühere verschachtelte Workflow wurde durch den echten Root-Workflow ersetzt.
