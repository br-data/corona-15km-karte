$(function () {
	let map, layerBackground, layerBorders, layerLabels;
	let data = {borders:false};

	init();
	loadJSON('assets/data/bayern.topo.json', res => data.borders = topojson.feature(res, res.objects.bayern));

	function init() {
		map = L.map('map', {
			center: [48.95, 11.395],
			zoom: 7,
			preferCanvas: true,
			zoomControl: true,
		});
		layerBackground = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 19,
		}).addTo(map);

		map.zoomControl.setPosition('topright');
	}

	function start() {
		layerBorders = L.geoJSON(data.borders, { style: {
			stroke: false,
			fill: false,
			color: '#0099ff',
			fillColor: 'rgba(0,157,255,0.8)',
			fillOpacity: 1,
			opacity: 1,
			weight: 1,
		}}).addTo(map);

		layerLabels = L.layerGroup().addTo(map);

		if (false) {
			layerBorders.on('mouseover', e => {
				let t = e.sourceTarget;
				if (t) showLayer(t);
			});
			layerBorders.on('mouseout', e => {
				let t = e.sourceTarget;
				if (t && !t.isSelected) hideLayer(t);
			});
		}

		layerBorders.on('click', e => {
			let t = e.sourceTarget;
			if (t) select(t);
		})

		autocomplete(
			$('#search'),
			layerBorders.getLayers().map(l => [
				l.feature.properties.GEN,
				() => {
					select(l);
					map.panTo(l.center);
				}
			])
		);

		function select(l0) {
			layerBorders.getLayers().forEach(l => {
				if (l.isSelected) {
					l.isSelected = false
					hideLayer(l);
				}
			})
			l0.isSelected = true;
			showLayer(l0);
		}

		function showLayer(l) {
			if (!l.radius) addRadius(l);
			
			let opacity = l.isSelected ? 1 : 0.4;
			l.setStyle({stroke:true, fill:true, opacity:opacity, fillOpacity:opacity});
			l.radius.setStyle({stroke:true, fill:true, opacity:opacity, fillOpacity:opacity});
			l.marker.setOpacity(opacity);

			if (l.isSelected) {
				l.bringToFront();
				l.radius.bringToFront();
			}
		}

		function hideLayer(l) {
			if (!l.radius) addRadius(l);

			l.setStyle({stroke:false, fill:false})
			l.radius.setStyle({stroke:false, fill:false})
			l.marker.setOpacity(0)
		}

		function addRadius(l) {
			let feature = l.feature;

			feature = turf.clone(feature);
			switch (feature.geometry.type) {
				case 'Polygon': feature.geometry.coordinates = feature.geometry.coordinates.splice(0,1); break;
				case 'MultiPolygon': feature.geometry.coordinates = feature.geometry.coordinates.map(c => c.splice(0,1)); break;
				default: throw Error(feature.geometry.type)
			}

			feature = turf.rewind(feature);
			feature = turf.buffer(feature, 15, {units:'kilometers', steps:60});

			l.bbox = turf.bbox(feature);
			l.center = [(l.bbox[1]+l.bbox[3])/2, (l.bbox[0]+l.bbox[2])/2];

			let layer = L.GeoJSON.geometryToLayer(feature, {interactive:false});
			layer.setStyle({
				stroke:false,
				fill:false,
				color:'#0099ff',
				weight:1,
				fillColor: 'rgba(0,157,255,0.2)',
			});
			layer.feature = L.GeoJSON.asFeature(feature);

			l.radius = layer;
			layerBorders.addLayer(layer);

			let icon = L.divIcon({
				html:'<p>'+l.feature.properties.GEN+'</p>',
				className:'mapLabel',
				iconSize:[200,0],
			});
			let marker = L.marker([l.bbox[3], l.center[1]], {icon, interactive:false}).addTo(layerLabels);
			l.marker = marker;
		}
	}

	function loadJSON(url, cb) {
		$.getJSON(url, result => {
			cb(result);
			if (data.borders) start();
		})
	}
})

function autocomplete(input, arr) {
	let currentFocus, list, elements;

	arr.sort((a,b) => a[0] < b[0] ? -1 : 1);

	input.on('input', e => {
		let val = input.val();
		if (!val) return false;

		currentFocus = -1;
		if (!list) {
			list = $('<div class="autocomplete-items"></div>');
			input.parent().append(list);
		}

		let result = arr.filter(entry => entry[0].substr(0, val.length).toUpperCase() === val.toUpperCase());
		result = result.slice(0,10);

		clearLists();
		elements = result.map(entry => {
			let text = entry[0];
			let element = $('<div><strong>'+text.substr(0, val.length)+'</strong>'+text.substr(val.length)+'<input type="hidden" value="' + text + '"></div>');
			element.on('click', e => {
				input.val(text);
				if (entry[1]) entry[1]();
				clearLists();
			});
			list.append(element);
			return element;
		})
	});

	input.on('keydown', function(e) {
		if (!list) return;

		if (e.keyCode === 40) { // down
			currentFocus++;
			highlightActive();
		} else if (e.keyCode === 38) { // up
			currentFocus--;
			highlightActive();
		} else if (e.keyCode === 13) { // enter
			e.preventDefault();
			if (currentFocus > -1) {
				if (elements[currentFocus]) elements[currentFocus].click();
			} else {
				currentFocus = 0;
				highlightActive();
			}
		}
	});

	function highlightActive() {
		if (currentFocus >= elements.length) currentFocus = 0;
		if (currentFocus < 0) currentFocus = (elements.length - 1);
		elements.forEach((element, i) => {
			element.toggleClass('autocomplete-active', (i === currentFocus))
		})
	}

	function clearLists() {
		if (!list) return;
		list.empty();
	}

	$(document).on('click', clearLists);
}