"use strict"

const fs = require('fs');
const {resolve} = require('path');



let gemeinden = fs.readFileSync(resolve(__dirname, '../data/gemeinden.geo.json'));
gemeinden = JSON.parse(gemeinden);


// Welche Regionen sollen extrahiert werden?
// Dazu muss man den entsprechenden regulären Ausdruck für die Gemeindeschlüssel definieren.
// 
// 01 - Schleswig-Holstein
// 02 - Freie und Hansestadt Hamburg
// 03 - Niedersachsen
// 04 - Freie Hansestadt Bremen
// 05 - Nordrhein-Westfalen
// 06 - Hessen
// 07 - Rheinland-Pfalz
// 08 - Baden-Württemberg
// 09 - Freistaat Bayern
// 10 - Saarland
// 11 - Berlin
// 12 - Brandenburg
// 13 - Mecklenburg-Vorpommern
// 14 - Freistaat Sachsen
// 15 - Sachsen-Anhalt
// 16 - Freistaat Thüringen

let regExpAGS = /^09/; // nur Bayern

gemeinden.features = gemeinden.features.filter(f => regExpAGS.test(f.properties.AGS));

gemeinden.features.forEach(f => {
	f.properties = {
		GEN: f.properties.GEN,
		BEZ: f.properties.BEZ,
	}
})

fs.writeFileSync(resolve(__dirname, '../data/region.geo.json'), JSON.stringify(gemeinden));
