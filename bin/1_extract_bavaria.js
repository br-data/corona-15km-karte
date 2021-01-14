"use strict"

const fs = require('fs');
const {resolve} = require('path');



let gemeinden = fs.readFileSync(resolve(__dirname, '../data/gemeinden.geo.json'));
gemeinden = JSON.parse(gemeinden);

gemeinden.features = gemeinden.features.filter(f => f.properties.AGS.startsWith('09'));

gemeinden.features.forEach(f => {
	f.properties = {
		GEN: f.properties.GEN,
		BEZ: f.properties.BEZ,
	}
})

fs.writeFileSync(resolve(__dirname, '../data/bayern.geo.json'), JSON.stringify(gemeinden));
