"use strict"

const fs = require('fs');
const {resolve} = require('path');
const {topology} = require('topojson-server');
const {presimplify,simplify,sphericalTriangleArea} = require('topojson-simplify');


let region = fs.readFileSync(resolve(__dirname, '../data/region.geo.json'));
region = JSON.parse(region);

// generate topojson
region = topology({region}, 1e6);

// simplify to make it smaller
let ps = presimplify(region, sphericalTriangleArea);
region = simplify(ps, 1e-9);

fs.writeFileSync(resolve(__dirname, '../docs/region.topo.json'), JSON.stringify(region), 'utf8');

