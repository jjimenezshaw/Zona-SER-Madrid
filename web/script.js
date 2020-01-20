"use strict"

var center = [40.4338300, -3.6886756];
var zoom = 14;

var copyr = '<a href="http://javier.jimenezshaw.com" target="_blank">@ Javier Jimenez Shaw</a> | ';
// Define some base layers
var osm = L.tileLayer(
    '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {attribution: copyr + '© OpenStreetMap contributors', maxZoom: 19}
);

var wiki = L.tileLayer(
    '//maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
    {attribution: copyr + '© OpenStreetMap contributors', maxZoom: 19}
);

var esri_map =  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    {attribution: copyr + '© Esri.com', maxZoom: 19}
);

var esri_sat =  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {attribution: copyr + '© Esri.com', maxZoom: 21}
);

var baseTree = [
    {label: "OSM", layer: osm},
    {label: "Wikimedia", layer: wiki},
    {label: "Esri Map", layer: esri_map},
    {label: "Esri Sat", layer: esri_sat},
];

// The map
var map = L.map('map', {
    layers: [wiki],
    center: center,
    zoom: zoom,
    maxZoom: 21,
});

var layers_in_control = [];
var tree = L.control.layers.tree(baseTree, layers_in_control, {collapsed: false});
tree.addTo(map);


var zonas_ids = []
var zonas_layerGroup = {}

var xhr0 = new XMLHttpRequest();
xhr0.open('GET', 'zonas_ser.geojson');
xhr0.setRequestHeader('Content-Type', 'application/json');
xhr0.responseType = 'json';
xhr0.onload = function() {
    if (xhr0.status !== 200) return
    var jsonLayer = L.geoJSON(xhr0.response,
        {
            style: {
                fillColor: 'yellow',
                color: 'MEDIUMORCHID',
                opacity: 0.8,
                fillOpacity: 0.05
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties.name) {
                    var id = feature.properties.name.substr(0,2);
                    zonas_ids.push(id);
                    layer.bindTooltip(feature.properties.name, {opacity: 0.5}).openTooltip();
                    layer.on('click', function(ev) {
                        if (id in zonas_layerGroup) {
                            var lay = zonas_layerGroup[id];
                            if (map.hasLayer(lay)) {
                                map.removeLayer(lay);
                            } else {
                                map.addLayer(lay);
                            }
                        }
                    });
                }
            }
        });
    jsonLayer.addTo(map);
    download_zonas_json();
}
xhr0.send();

function download_zonas_json() {
    zonas_ids.forEach(function(zona, index) {
        var xhr1 = new XMLHttpRequest();
        xhr1.open('GET', 'plazas_zona_ser_' + zona + '.geojson');
        xhr1.setRequestHeader('Content-Type', 'application/json');
        xhr1.responseType = 'json';
        xhr1.onload = function() {
            if (xhr1.status !== 200) return
            var zonas = {}
            L.geoJSON(xhr1.response,
                {
                    style: function (feature) {
                        if (feature.properties.style) {
                            return feature.properties.style;
                        }
                    },
                    pointToLayer: function (feature, latlng) {
                        if (feature.properties.circle) {
                            return L.circleMarker(latlng, feature.properties.circle);
                        } else {
                            return L.marker(latlng);
                        }
                    },
                    onEachFeature: function (feature, layer) {
                        var zona = feature.properties.zona;
                        var description = feature.properties.description;
                        if (zona) {
                            zonas[zona] = zonas[zona] || [];
                            zonas[zona].push(layer);
                        }
                        if (description) {
                            layer.bindPopup(description);
                        }
                    }
                });

            Object.keys(zonas).sort().forEach(function(zona) {
                var layers = zonas[zona];
                zonas_layerGroup[zona] = L.layerGroup(layers);
                layers_in_control.push({label: "Zona " + zona, layer: zonas_layerGroup[zona]});
            });

            layers_in_control.sort(function(a,b) { return a.label.localeCompare(b.label)});
            var lastAdd = layers_in_control.length == zonas_ids.length;
            tree.remove();
            tree = L.control.layers.tree(baseTree, layers_in_control, {collapsed: lastAdd});
            tree.addTo(map);
            if (lastAdd) console.log("Zonas Loaded " + layers_in_control.length)
        };
        xhr1.send();
    });
}