"use strict"

function load_json (path, callback) {
    var xhr0 = new XMLHttpRequest();
    xhr0.open('GET', path);
    xhr0.setRequestHeader('Content-Type', 'application/json');
    xhr0.responseType = 'json';
    xhr0.onload = function() {
        if (xhr0.status !== 200) return
        callback(xhr0.response);
    };
    xhr0.send();
}

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
L.control.scale({imperial: false}).addTo(map);
var barrio_text = L.control({position: 'bottomleft'});
barrio_text.onAdd = function(map) {return L.DomUtil.create('div', 'text_barrio')};
barrio_text.onRemove = function(map) {};
barrio_text.addTo(map);


var zonas_ids = []
var zonas_layerGroup = {}

load_json('zonas_ser.geojson', function(response){
    var jsonLayer = L.geoJSON(response,
        {
            style: {
                fillColor: 'yellow',
                color: 'mediumorchid',
                opacity: 0.8,
                fillOpacity: 0.08
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties.name) {
                    var id = feature.properties.name.substr(0,2);
                    zonas_ids.push(id);
                    layer.on('mouseover', function (e) {
                        barrio_text.getContainer().innerHTML = feature.properties.name;
                    });
                    layer.on('mouseout', function (e) {
                        barrio_text.getContainer().innerHTML = '';
                    });
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
    download_plazas_json();
});

function download_plazas_json() {
    zonas_ids.forEach(function(zona) {
        load_json('plazas_zona_ser_' + zona + '.geojson', function(response){
            var zonas = {}
            L.geoJSON(response, {
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
        });
    });
}