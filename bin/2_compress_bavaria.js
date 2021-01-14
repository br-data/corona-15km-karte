"use strict"

const fs = require('fs');
const {resolve} = require('path');
const {topology} = require('topojson-server');
const {presimplify,simplify,sphericalTriangleArea} = require('topojson-simplify');


let bayern = fs.readFileSync(resolve(__dirname, '../data/bayern.geo.json'));
bayern = JSON.parse(bayern);

bayern = topology({bayern}, 1e6);

let ps = presimplify(bayern, sphericalTriangleArea);
bayern = simplify(ps, 1e-9);

fs.writeFileSync(resolve(__dirname, '../docs/bayern.topo.json'), JSON.stringify(bayern), 'utf8');

