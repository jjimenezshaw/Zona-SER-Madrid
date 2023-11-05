"use strict"

var zonas_ids = [];
var zonas_layerGroup = {};
var basemaps = {};

function load_json (path, callback) {
    try {
        var xhr0 = new XMLHttpRequest();
        xhr0.open('GET', path);
        xhr0.setRequestHeader('Content-Type', 'application/json');
        xhr0.responseType = 'json';
        xhr0.onload = function() {
            if (xhr0.status !== 200) return
            callback(xhr0.response);
        };
        xhr0.send();
    } catch(error) {
        console.log(error);
    }
}
function compute_url() {
    var selected = [];
    var basemapid;
    Object.keys(zonas_layerGroup).forEach(function(id){
        var lay = zonas_layerGroup[id];
        if (map.hasLayer(lay)) {
            selected.push(id);
        }
    });
    Object.keys(basemaps).forEach(function(id){
        var lay = basemaps[id];
        if (map.hasLayer(lay)) {
            basemapid = id;
        }
    });
    var center = map.getCenter().lat.toFixed(6) + "," + map.getCenter().lng.toFixed(6);
    var zoom = map.getZoom();

    update_url(center, zoom, basemapid, selected.join(","));
}
function update_url(center, zoom, basemapid, selected) {
    var url = window.location.href;
    var urlParts = url.split('?');
    if (urlParts.length > 0) {
        var baseUrl = urlParts[0];

        var selected_str = selected ? '&s=' + selected : '';
        var basemapid_str = basemapid ? '&b=' + basemapid : '';
        var updatedQueryString = 'c=' + center + '&z=' + zoom + basemapid_str + selected_str;

        var updatedUri = baseUrl + '?' + updatedQueryString;
        window.history.replaceState({}, document.title, updatedUri);
    }
}

function parse_url() {
    // see also https://stackoverflow.com/questions/8486099/how-do-i-parse-a-url-query-parameters-in-javascript
    var params = {};
    var search = location.search.substr(1);
    if (search.length === 0) {
        return {};
    }
    var definitions = search.split('&');
    if (definitions.length < 2) {
        search = decodeURIComponent(search);
        definitions = search.split('&');
    }

    definitions.forEach(function (val) {
        var parts = val.split('=', 2);
        var key = decodeURIComponent(parts[0]);
        var value = parts[1];
        params[key] = value;
    });

    return params;
}

var center = [40.4338300, -3.6886756];
var zoom = 14;

var copyr = '<a href="http://javier.jimenezshaw.com" target="_blank">@ Javier Jimenez Shaw</a> | ';

// Define some base layers

var ign = L.tileLayer(
    '//www.ign.es/wmts/ign-base?layer=IGNBaseTodo&tilematrixset=EPSG:3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}',
    {attribution: copyr + '© IGN.es', maxZoom: 20}
);

var osm = L.tileLayer(
    '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {attribution: copyr + '© OpenStreetMap contributors', maxZoom: 19}
);

var esri_map = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    {attribution: copyr + '© Esri.com', maxZoom: 19}
);

var esri_sat = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {attribution: copyr + '© Esri.com', maxZoom: 21}
);

basemaps = {
    ign: ign,
    osm: osm,
    esri_map: esri_map,
    esri_sat: esri_sat
};

var baseTree = [
    {label: "IGN", layer: ign},
    {label: "OSM", layer: osm},
    {label: "Esri Map", layer: esri_map},
    {label: "Esri Sat", layer: esri_sat},
];

// The map
var map = L.map('map', {
    layers: [ign],
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

load_json('zonas.geojson', function(response){
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
                    var id = feature.properties.zona;
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
            zonas_layerGroup[zona] = L.layerGroup([]);
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
                layers_in_control.push({label: "Zona " + zona, id: Number(zona), layer: zonas_layerGroup[zona]});
            });

            layers_in_control.sort(function(a,b) { return a.id - b.id; });
            var lastAdd = layers_in_control.length == zonas_ids.length;
            tree.remove();
            tree = L.control.layers.tree(baseTree, layers_in_control, {collapsed: lastAdd});
            tree.addTo(map);
            if (lastAdd) {
                map.on('moveend zoomend overlayadd overlayremove baselayerchange', function(e) {
                    compute_url();
                });
                var params = parse_url();
                console.log("Zonas Loaded " + layers_in_control.length);
                if (params['b'] && params['b'] in basemaps) {
                    map.addLayer(basemaps[params['b']]);
                }
                if (params['z'] && params['c']) {
                    map.flyTo(params['c'].split(','), parseInt(params['z']));
                }
                if (params['s']) {
                    params['s'].split(',').forEach(function(id) {
                        if (id in zonas_layerGroup) {
                            map.addLayer(zonas_layerGroup[id]);
                        }
                    });
                }
            }
        });
    });
}
