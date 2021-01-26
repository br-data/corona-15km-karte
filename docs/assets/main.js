$(function () {
	let map, layerBackground, layerBorders, layerLabels;
	let data = {borders:false};

	extendLeaflet();
	init();
	loadJSON('region.topo.json', res => data.borders = topojson.feature(res, res.objects.region));

	function init() {
		let minBBox = L.latLngBounds(viewBox).pad(-0.1);
		let maxBBox = L.latLngBounds(boundingBox).pad( 0.2);

		map = L.map('map', {
			maxBounds: maxBBox,
			center: minBBox.getCenter(),
			preferCanvas: true,
			zoomControl: true,
			minZoom: 6,
			maxZoom: 14,
		});

		layerBackground = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png', {
			subdomains: 'abcd',
			maxZoom: 19,
		}).addTo(map);

		let prefix = [
			'<a target="_blank" href="https://github.com/br-data/corona-15km-karte">Code auf GitHub</a>',
			'<a target="_blank" href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a> <a target="_blank" href="https://gdz.bkg.bund.de/index.php/default/digitale-geodaten/verwaltungsgebiete/verwaltungsgebiete-1-250-000-ebenen-stand-01-01-vg250-ebenen-01-01.html">BKG</a>',
			'&copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OSM</a>',
			'&copy; <a target="_blank" href="https://carto.com/attributions">CARTO</a>',
		]
		if (window.self !== window.top) prefix.push('<a target="_blank" href=".">In neuem Tab öffnen</a>');
		map.attributionControl.setPrefix(prefix.join(' | '));
		map.zoomControl.setPosition('topright');

		let header = L.controlHTML({position:'topleft', node:'#header'}).addTo(map);
		let footer = L.controlHTML({position:'bottomleft', node:'#footer'}).addTo(map);
		
		map.fitBounds(minBBox);
	}

	function start() {
		layerBorders = L.geoJSON(data.borders, { style: {
			stroke: false,
			fill: false,
			color: 'rgb('+primaryColor+')',
			fillColor: 'rgba('+primaryColor+',0.6)',
			fillOpacity: 1,
			opacity: 1,
			weight: 1,
		}}).addTo(map);

		layerLabels = L.layerGroup().addTo(map);

		let alreadyClicked = false;
		if (!L.Browser.mobile) {
			layerBorders.on('mouseover', e => {
				//if (alreadyClicked) return;
				let t = e.sourceTarget;
				if (t) showLayer(t);
			});
			layerBorders.on('mouseout', e => {
				//if (alreadyClicked) return;
				let t = e.sourceTarget;
				if (t && !t.isSelected) hideLayer(t);
			});
		}

		layerBorders.on('click', e => {
			alreadyClicked = true;
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
				stroke: false,
				fill: false,
				color: 'rgb('+primaryColor+')',
				weight: 1,
				fillColor: 'rgba('+primaryColor+',0.2)',
			});
			layer.feature = L.GeoJSON.asFeature(feature);

			l.radius = layer;
			layerBorders.addLayer(layer);

			let icon = L.divIcon({
				html:'<p style="color:rgb('+primaryColor+')">'+l.feature.properties.GEN+'</p>',
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

function extendLeaflet() {
	let ControlHTML = L.Control.extend({
		options: {
			position: 'topleft'
		},

		initialize: function (options) {
			L.setOptions(this, options);
		},

		onAdd: function (map) {
			let node = $(this.options.node);
			let container = $('<div class="leaflet-control"></div>');
			container.html(node.html());
			container.attr('id', node.attr('id'));

			node.remove();

			this._container = container.get(0);
			this._update();

			L.DomEvent.disableClickPropagation(this._container);

			return this._container;
		},

		_update: function () {
		}
	});

	let controlHTML = function (options) {
		return new ControlHTML(options);
	};

	L.ControlHTML = ControlHTML;
	L.controlHTML = controlHTML;
}
