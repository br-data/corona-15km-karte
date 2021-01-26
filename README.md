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

## Datenquellen und Lizenzen

### Gemeindegrenzen

Die [Grenzen stammen vom Bundesamt für Kartographie und Geodäsie](https://gdz.bkg.bund.de/index.php/default/digitale-geodaten/verwaltungsgebiete/verwaltungsgebiete-1-250-000-ebenen-stand-01-01-vg250-ebenen-01-01.html), werden vom [Bundesamt für Kartographie und Geodäsie](https://www.bkg.bund.de/DE/Home/home.html) unter [Datenlizenz Deutschland – Namensnennung – Version 2.0](https://www.govdata.de/dl-de/by-2-0) veröffentlicht und liegen hier als GeoJSON in `data/gemeinden.geo.json`.

Lizenzhinweis: [dl-de/by-2-0](https://www.govdata.de/dl-de/by-2-0) [BKG](https://gdz.bkg.bund.de/index.php/default/digitale-geodaten/verwaltungsgebiete/verwaltungsgebiete-1-250-000-ebenen-stand-01-01-vg250-ebenen-01-01.html)

### Hintergrundkarte

Die Hintergrundkarte ist eine [CARTO basemap](https://carto.com/help/building-maps/basemap-list/), die für [nichtkommerzielle Verwendungen kostenlos](https://go.carto.com/hubfs/CARTO-Free-Basemaps-Terms-of-Service.pdf) nutzbar ist, und [Daten von OpenStreetMap](https://www.openstreetmap.org/copyright) verwendet.

Lizenzhinweis: ©[OSM](https://www.openstreetmap.org/copyright), ©[CARTO](https://carto.com/attributions)






