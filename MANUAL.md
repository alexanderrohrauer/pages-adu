# PAGES – Bedienungsanleitung

## Kurzbeschreibung

PAGES (**P**rompt-based **A**I **G**eneration **E**ngine for **S**ites) ist ein No-Code-Werkzeug, das Websites per Chat erstellt und ändert – ohne dass der Nutzer Code sieht. Man beschreibt im Chat, was man möchte; eine KI setzt dies im echten Software-Projekt um (Seiten, Komponenten, Inhalte) und zeigt das Ergebnis live in der Preview. Für Inhalte, die man später oft selbst ändert (z. B. Speisekarte, Öffnungszeiten, Fotos), richtet die KI zusätzlich ein CMS ein, das man danach ohne Chat direkt bedienen kann.

Kurz: **Layout, Struktur und Funktionen** entstehen per Chat mit der KI; **redaktionelle Inhalte** pflegt man direkt im CMS. Anders als klassische „Vibe-Coding“-Tools erzeugt PAGES dabei nicht nur Code passend zur Eingabe, sondern hilft strukturiert die richtige Lösung zu bauen („agentische Softwareentwicklung“).

---

## Begriffe

- **Artefakt** – Eine einzelne Website/Webanwendung in PAGES, mit eigenem Namen, eigenem Code-Stand (aus einer Vorlage erzeugt) und eigener Liste von Änderungsanfragen.
- **Änderungsanfrage** – Ein Chat-Thread innerhalb eines Artefakts für eine konkrete Aufgabe – von der Ersterstellung bis zur kleinsten Textänderung. Erhält automatisch einen Titel und ggf. Links (z. B. ins CMS). Empfehlung: pro Unterseite (z. B. „/kontakt“) eine eigene Änderungsanfrage.
- **Intent** – Die eigentliche Absicht hinter einer Chat-Nachricht, unabhängig von deren technischer Präzision. Die KI erfasst den Intent (fragt bei Bedarf nach) und übersetzt ihn in Seiten, Inhalte und Funktionen („Intent-Driven Development“).
- **Asset** – Eine Mediendatei (Foto, Logo, Grafik), die als Chat-Anhang oder als Upload im CMS ins Artefakt gelangt.
- **Directus / CMS** – Das von PAGES eingerichtete CMS ([directus.com](https://directus.com/)) für strukturierte, oft wechselnde Inhalte (Speisekarte, Öffnungszeiten, Kontaktdaten, Galerie, Formular-Nachrichten). Die KI legt die Datenstruktur an und verbindet sie mit der Website; danach lassen sich Inhalte direkt in Directus bearbeiten – ganz ohne Chat.
- **Preview** – Live-Ansicht der aktuellen Website, eingebettet neben dem Chat oder als eigener Tab. Aktualisiert sich automatisch bei Änderungen; öffnenbar über „Preview öffnen“ in der Kopfleiste.
- **Advanced Mode** – Einstellung (Zahnrad-Menü, Seitenleiste), die steuert, ob im Chat nur Endergebnisse (Aus, Standard) oder jeder technische Arbeitsschritt der KI (Ein) sichtbar sind.

---

## Kurzbeispiel: „SushiExpress“

1. **Artefakt anlegen:** Auf „New Artifact“ klicken, Namen eingeben (z. B. „SushiExpress“), mit „Create“ bestätigen – PAGES legt das Artefakt an und öffnet direkt eine neue Änderungsanfrage.
2. **Intent beschreiben:** Im Chat die Website-Wünsche formulieren (Adresse, Öffnungszeiten, gewünschte Bereiche wie Speisekarte/Galerie/Kontakt, Stil/Farben). Die KI stellt bei Bedarf Rückfragen, teils als kurzes Formular. Logos oder Stilbeispiele lassen sich als Anhang mitschicken (Büroklammer-Symbol), Layout-Ideen über das Sketch-Feature (Stift-Symbol).
3. **Umsetzung:** Die KI zerlegt den Intent in Teilziele, erzeugt Seiten und Komponenten, richtet im CMS die passende Datenstruktur ein (z. B. Menü-Positionen, Galerie-Bilder) und öffnet automatisch die Preview. Mit Advanced Mode lassen sich die einzelnen Arbeitsschritte im Detail verfolgen. Am Ende erhält die Änderungsanfrage einen Titel und ggf. einen Link zum CMS.
4. **Prüfen & anpassen:** Ergebnis in der Preview begutachten (auch vollflächig über „In neuem Tab öffnen“); weitere Wünsche (z. B. „Rotton dunkler machen“) als neue Chat-Nachricht formulieren.
5. **Inhalte im CMS pflegen:** Für strukturelle Änderungen bleibt der Chat der richtige Weg. Für inhaltliche Änderungen (neue Gerichte, Preise, Fotos, Öffnungszeiten) genügt ein Klick auf den Link in der Kopfleiste der Änderungsanfrage – er öffnet Directus direkt bei der passenden Sammlung. Änderungen erscheinen automatisch in der Preview, ganz ohne neue Änderungsanfrage.
