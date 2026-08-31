# Kontakt — aktueller Stand und optionaler Direktversand

## Was jetzt funktioniert

Das bestehende Formularlayout bleibt erhalten. Pflichtfelder, E-Mail, Längen, Kategorie, Datenschutzhinweis und Honeypot werden geprüft. Der Knopf **E-Mail vorbereiten** erstellt ausschließlich einen lokal kodierten mailto-Entwurf. Ein zweiter, ausdrücklich benannter Link öffnet das eigene E-Mail-Programm. Erst dort wird gesendet. Ohne Mailprogramm bitte die angezeigte Adresse kopieren und Webmail verwenden. Kein Versandnachweis, keine serverseitige Speicherung, kein vorgetäuschter Erfolg.

| Anliegen | Empfänger |
| --- | --- |
| Direkter Kontakt | hello@nexusnetwork.pro |
| Finanzberater-Anbindung | anbindung@nexusnetwork.pro |
| Kooperation | kooperation@nexusnetwork.pro |
| Allgemeine Anfrage | frage@nexusnetwork.pro |

Betreiber muss alle Postfächer bzw. Aliasse einrichten und Empfang/Antwortfähigkeit prüfen. Es wurden keine Testnachrichten extern gesendet. Der E-Mail-Entwurf kann je nach Mailprogramm Längenbegrenzungen unterliegen; Nachricht ist auf 2.000 Zeichen begrenzt. Eingaben werden nicht in localStorage gespeichert.

## Wenn echter Versand direkt auf der Website gewünscht ist

Ein externer Formular-Dienst wie **Formspree** kann das statische Hosting ergänzen. Die offizielle Anleitung beschreibt einen öffentlichen Form-Endpunkt und das Absenden per HTML/AJAX: [HTML-Integration](https://help.formspree.io/articles/building-your-form/building-an-html-form/), [AJAX-Integration](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax). Konditionen und aktuell verfügbare Kontingente vor Auswahl prüfen; kein kostenpflichtiger Dienst wurde beauftragt.

Vor Integration müssen Betreiber und Entwickler:

- Datenschutz, Auftragsverarbeitung, Unterauftragnehmer, Speicherort und Löschfristen prüfen.
- Empfänger beim Dienst verifizieren und Kategorien dort fest zuordnen; keine frei wählbaren Empfänger aus Browserdaten akzeptieren.
- Serverseitige Validierung, Spam-Schutz und Rate-Limits einrichten. Der lokale Honeypot ersetzt das nicht.
- Nur die öffentliche Formular-ID im Frontend verwenden; niemals SMTP-Passwort oder private API-Zugangsdaten.
- CSP gezielt um den geprüften Endpoint erweitern; keine Wildcard-Netzwerkfreigabe.
- Fehlermeldungen, Offline-Fall, 429, echte bestätigte Annahme und Barrierefreiheit testen.
- Datenschutzerklärung vor Aktivierung anpassen und mit genehmigten Testdaten einen Zustelltest durchführen.

Bis zu dieser separaten Einrichtung bleibt der ehrliche E-Mail-Entwurf aktiv. Kein Drittanbieter wird automatisch kontaktiert.
