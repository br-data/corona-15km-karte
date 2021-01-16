"use strict"

const fs = require('fs');
const zlib = require('zlib');
const {resolve} = require('path');
const {topology} = require('topojson-server');
const {presimplify,simplify,sphericalTriangleArea,filter,filterWeight,sphericalRingArea} = require('topojson-simplify');
const {quantize} = require('topojson-client');

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

let regExpAGS = /^/; // nur Bayern





let region = fs.readFileSync(resolve(__dirname, '../data/gemeinden.geo.json'));
region = JSON.parse(region);

// extract region
region.features = region.features.filter(f => regExpAGS.test(f.properties.AGS));


// cleanup properties
region.features.forEach(f => {
	f.properties = {
		GEN: f.properties.GEN,
		//BEZ: f.properties.BEZ,
	}
})

// generate topojson
region = topology({region}, Math.pow(2,18));
let transform = region.transform;

// simplify to make it smaller
let ps = presimplify(region, sphericalTriangleArea);
region = simplify(ps, 3e-9);
region = filter(region, filterWeight(region, 1e-8, sphericalRingArea));
region = quantize(region, transform);

// save topojson
fs.writeFileSync(resolve(__dirname, '../docs/region.topo.json'), JSON.stringify(region), 'utf8');


