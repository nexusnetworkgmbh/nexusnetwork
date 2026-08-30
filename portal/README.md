# Nexus Network — statisches Partnerportal

Das Portal ist jetzt vollständig statisch exportierbar. Keine SSR-Cookies, Server Actions, Middleware oder Next-API-Routes. Browser-Checks sind UX; RLS, Spaltengrants, DB-Constraints und autorisierte RPCs entscheiden über jeden Zugriff.

Installation und Gesamt-Build im Repository-Stamm: `npm ci`, `npm run build`. Beide Apps werden in Root-`out/` zusammengeführt. `npm run dev` startet das Portal auf Port 3001; Gesamtvorschau mit `npm run preview`.

Backend: beide Dateien unter supabase/migrations in Reihenfolge. Kein Secret für den statischen Build. Google vorbereitet/deaktiviert; Apple entfernt. Dynamische UUID-Details sind feste /detail/ und /edit/-Routen mit Queryparameter.

Verbindliche aktuelle Dokumentation:
- [Supabase-Betrieb](../docs/SUPABASE-PRODUCTION.md)
- [Statisches Deployment](../docs/STATIC-DEPLOYMENT.md)
- [Sicherheitsabnahme](../docs/SECURITY-STATIC.md)

Die alten Dateien in docs/ beschreiben den ursprünglichen SSR-Stand und sind keine aktuelle Deployment-Anleitung. Produktionsurteil: **NOT READY FOR PRODUCTION**.
