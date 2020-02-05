#!/usr/bin/env python3

import argparse
import utm
import csv
import geojson
import json


def getPoint(row):
    x = float(row['Gis_X'].replace(',', '.'))
    y = float(row['Gis_Y'].replace(',', '.'))
    latlon = utm.to_latlon(x, y, 30, northern=True)
    point = geojson.Point(latlon[::-1], precision=8)
    return point

def getZona(row):
    zona = row['Barrio'][1] + row['Barrio'][4]
    return zona

def getCalle(row, number_field):
    calle = row['Calle'].split(", ")
    calle = " ".join(calle[1:] + [calle[0]])
    if number_field:
        calle = calle + " " + row[number_field]
    return calle

def addFeature(feature, zona, featureColls):
    try:
        coll = featureColls[zona]
    except KeyError:
        coll = []
        featureColls[zona] = coll
    coll.append(feature)

def run(inputcsv, parquimetros, outputgeojson, encoding):
    featureColls = {}
    colors = {"Verde": "green", "Azul": "blue", "Rojo": "red", "Naranja": "orange"}

    with open(parquimetros, newline='', encoding=encoding) as csvfile:
        reader = csv.DictReader(csvfile, delimiter=';')
        for row in reader:
            point = getPoint(row)
            zona = getZona(row)
            calle = getCalle(row, 'Número de Finca')
            stroke = "black"
            feature = geojson.Feature(geometry=point, properties={
                "description": "Parquímetro " + row['Matrícula'] + "<br> " + calle + "<br> Zona: " + zona,
                "stroke": stroke,
                "zona": zona,
                "parquimetro": True,
                "circle": {"radius": 5, "fillColor": stroke, "color": stroke, "fillOpacity": 0.8}
                })
            addFeature(feature, zona, featureColls)

    with open(inputcsv, newline='', encoding=encoding) as csvfile:
        reader = csv.DictReader(csvfile, delimiter=';')
        for row in reader:
            point = getPoint(row)
            zona = getZona(row)
            calle = getCalle(row, 'Nº Finca')
            stroke = colors[row['Color']]
            plazas = int(row['Número de Plazas'])
            feature = geojson.Feature(geometry=point, properties={
                "description": calle + "<br> plazas: " + str(plazas) + "<br> Zona: " + zona,
                "stroke": stroke,
                "zona": zona,
                "circle": {"radius": 5 + plazas/8.0, "fillColor": stroke, "color": stroke, "fillOpacity": 0.8}
                })
            addFeature(feature, zona, featureColls)

    zonas = []
    for k, v in featureColls.items():
        zonas.append(k)
        features = geojson.FeatureCollection(v, properties={"zona": k})
        with open(outputgeojson + k + ".geojson", "w") as write_file:
            json.dump(features, write_file)
    zonas.sort()
    print("Zonas procesed: ", len(zonas))
    print(zonas)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Parsea los ficheros csv de plazas y parquímetros de la Zona SER Madrid.')
    parser.add_argument('-i', '--input', dest='plazas',
                        default='../sources/Listado_plazas_SER_2020.csv',
                        help='fichero csv de plazas de la Zona SER Madrid "madrid.es: Zonas SER. Distintivos y parquímetros"')
    parser.add_argument('-p', '--parquimetros', dest='parquimetros',
                        default='../sources/Parquimetros_2020.csv',
                        help='fichero csv de parquímetros de la Zona SER Madrid')
    parser.add_argument('-o', '--output', dest='outputgeojson',
                        default='../web/plazas_zona_ser_',
                        help='fichero GeoJSON de salida')
    parser.add_argument('-e', '--encoding', dest='encoding',
                        default='ISO-8859-1',
                        help='encoding del fichero csv (default: ISO-8859-1)')

    # Files downloaded from
    # https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=4973b0dd4a872510VgnVCM1000000b205a0aRCRD'

    args = parser.parse_args()
    run(args.plazas, args.parquimetros, args.outputgeojson, args.encoding)