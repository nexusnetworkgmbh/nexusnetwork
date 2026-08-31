# Nexus Network — öffentliche Website

Bestehendes Design, Netzwerkanimation und Informationsseiten in einer statischen Next.js-App.
Installation und Veröffentlichungsvorbereitung im Repository-Stamm: `npm ci`, `npm run build`.
Ausschließlich Root-`out/` enthält auch die abschließenden CSP-Metatags.
Entwicklung: `npm run dev:site`; Vorschau: `npm run preview`.

Optionale öffentliche URL: `NEXT_PUBLIC_SITE_URL`, Standard https://nexusnetwork.pro.
Unternehmensangaben in `app/company.ts` enthalten ausdrücklich noch zu ergänzende Platzhalter.
Das Kontaktformular erstellt lokal einen E-Mail-Entwurf; die direkten Mail-Links funktionieren unabhängig von JavaScript.
Siehe [Deployment](../docs/STATIC-DEPLOYMENT.md) und [Kontakt](../docs/CONTACT-FORM.md).
