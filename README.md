# 15-km-Umkreisrechner

Ist Beta!

## Installation

- `git clone`
- `npm i`

## Anpassung

- In [`bin/1_extract_region.js` Zeile 28](https://github.com/br-data/corona-15km-karte/blob/develop/bin/1_extract_region.js#L28) kann man die Variable `regExpAGS` anpassen, um die Bundesländer auszuwählen, die exportiert werden sollen.
- Anschließend `node bin/1_extract_region.js` ausführen. Damit werden die notwendigen Geodaten als Topo-JSON erzeugt.
- Die Datei [`docs/assets/config.js`](https://github.com/br-data/corona-15km-karte/blob/develop/docs/assets/config.js) enthält zwei Parameter, um das Frontend anzupassen. Zum einen kann hier die Primärfarbe angepasst werden, als auch die Bounding-Box des Bundeslandes.
- Wenn man nun einen Webserver in `docs` startet, sollte bereits jetzt alles gut funktionieren.
- Mit `node bin/2_build.js` wird der Build-Prozess gestartet, der das Verzeichnis `publish` erzeugt und befüllt. Alle Dateien sind dann minified und sogar mit Zopfli komprimiert.
- Mit `node bin/3_server.js` oder `npm start` kann man einen express-Server starten, der die optimierte Version auf Port 3000 ausspielt.

Bei Fragen den [Autor](https://github.com/MichaelKreil) fragen. Bei Problemen bitte ein Issue anlegen.





