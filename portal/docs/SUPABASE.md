# Datenbank und Mandantenmodell

## Migration

Die Erstinstallation liegt in `supabase/migrations/20260830022641_release_one.sql`. Die Datei wurde mit der installierten Supabase-CLI angelegt und enthält eine atomare Transaktion. Für ein neues dediziertes Projekt ausführen; niemals gegen eine fremde bestehende Anwendung. Jede spätere Änderung erhält eine **neue** Migration; bereits ausgerollte Migrationen nicht umschreiben.

CLI: `pnpm exec supabase init` erzeugt die lokale Konfiguration. Vor Anwendung die Hilfe von `supabase db push` bzw. `supabase db reset` prüfen. Remote nur nach explizitem Verknüpfen des ausgewählten Nexus Network-Projekts anwenden. Lokal kann die SQL-Datei über den SQL-Client der lokalen Supabase-Instanz ausgeführt werden. Nicht Tabellen manuell nachbauen. Reihenfolge aller Migrationen ist aufsteigend nach Dateinamen.

Nach Anwendung: Tabellen/RLS im Projekt kontrollieren, `supabase db advisors` und die Testfälle aus TESTING.md gegen dieses Projekt ausführen. CLI-Advisor-Prüfung ist aktuell mangels verbundener Datenbank nicht erfolgt. Die Erstinstallation wurde stattdessen in echtem eingebettetem PostgreSQL (PGlite) ausgeführt und mit Rollenwechseln geprüft.

## Tabellen

- profiles: Auth-Referenz (`user_id` unique), eigene Profil-ID, persönliche Daten, Status, systemweite Rolle.
- organizations und organization_members: mehrere Nutzer pro Firma möglich; Besitzerrolle ist **keine** System-Adminrolle.
- partner_profiles: Antragsdaten und Consent-Zeitpunkt, Einreichungsstatus; verknüpft mit Mitgliedschaft.
- customers, deals, tasks, deal_notes: jede Zeile besitzt organization_id.
- deal_status_history: automatisch vom Trigger befüllt, keine Partner-Schreibrechte.
- audit_logs: nur trigger-/funktionsseitige Einträge, keine normalen Schreib-/Löschrechte.

Neue Auth-Accounts bekommen per Trigger atomar Profil `partner/pending`, Organisation und Mitgliedschaft. User-Metadaten liefern allenfalls gekürzte Namen, niemals Rechte. Systemrollen kommen ausschließlich aus profiles. Aktuell nutzt der Server die älteste Mitgliedschaft als Arbeitsorganisation; Team- und Organisationswechsel-UI ist noch nicht Bestandteil. Alle Mitgliedschaften werden bereits mandantenfähig modelliert.

Verknüpfungen verwenden zusammengesetzte Fremdschlüssel `(organization_id, id)`. Eine Aufgabe kann daher nicht auf eine fremde Vermittlung oder einen fremden Kunden zeigen. Zugewiesene Nutzer müssen Organisationsmitglieder sein. Bei einer Vermittlungsaufgabe wird der zugehörige Kunde automatisch gesetzt; widersprüchliche Zuordnungen werden verworfen.

Statuswechsel erzeugen Historie; Vermittlungsnummern entstehen aus einer Datenbanksequenz (`NN-JAHR-000000001`). Nummern sind global eindeutig; Lücken nach zurückgerollten Transaktionen sind normal. Beträge sind `numeric(14,2)`, keine Gleitkomma-Speicherung. Wichtige Mandanten-/Beziehungsabfragen sind indiziert.

## Ersten Administrator einrichten

1. Gewünschten Betreiberaccount regulär registrieren und E-Mail bestätigen.
2. In der Auth-Verwaltung die UUID dieses Accounts prüfen.
3. Ausschließlich als Datenbankbetreiber, nicht über die Website, gezielt folgende Anweisung ausführen. Platzhalter erst nach Identitätsprüfung ersetzen:

```sql
begin;
update public.profiles
set role = 'super_admin', status = 'active'
where user_id = 'HIER-DIE-GEPRUEFTE-AUTH-UUID'::uuid;
-- Genau eine betroffene Zeile prüfen, andernfalls ROLLBACK.
commit;
```

Der Profile-Trigger protokolliert auch diese Rollen-/Statusänderung. Bei einer direkten Betreiberaktion ohne Auth-Session ist actor_id null; die Datenbank-/Betreiberzugriffsaudits müssen ergänzend aufbewahrt werden. Es existiert bewusst keine Selbstbeförderungsroute und kein vordefiniertes Adminpasswort.

## Storage / Release 2

Supabase Storage ist der vorgesehene Dokumentenspeicher, aber es wird **kein** Bucket öffentlich angelegt. Zukünftige Dokumentmetadaten erhalten organization_id und private Bucket-Pfade; Uploadrechte und signierte URLs erst mit eigenen RLS-Policies/Testfällen aktivieren. Produktname/Produktgeber bleiben R1-Snapshots; später `product_id` und `product_provider_id` mit kontrolliertem Backfill ergänzen. Keine vorgetäuschten Uploadbuttons.

Referenz: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
