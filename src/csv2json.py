#!/usr/bin/env python3

import argparse
import utm
import csv
import geojson
import json

import os
import errno
from osgeo import ogr, osr

def silentremove(filename):
    try:
        os.remove(filename)
    except OSError as e: # this would be "except OSError, e:" before Python 2.6
        if e.errno != errno.ENOENT: # errno.ENOENT = no such file or directory
            raise # re-raise exception if a different error occurred

def getPoint(row):
    x = float(row['gis_x'].replace(',', '.'))
    y = float(row['gis_y'].replace(',', '.'))
    latlon = utm.to_latlon(x, y, 30, northern=True)
    point = geojson.Point(latlon[::-1], precision=8)
    return point

def getZona(row):
    zona = int(row['barrio'][0:2])*10 + int(row['barrio'][4])
    return str(zona)

def getCalle(row, number_field):
    calle = row['calle'].split(", ")
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

def tempLayer(name, srs=None, options=[]):
    driver = ogr.GetDriverByName('ESRI Shapefile')
    memDS = driver.CreateDataSource('/vsimem/'+name+'.shp')
    layer = memDS.CreateLayer(name, srs=srs, options=options)
    return (layer, memDS)


def run2(zipfile, parquimetros, outputgeojson, out_zonas_filename):
    shp_driver = ogr.GetDriverByName('ESRI Shapefile')
    inDataSource = shp_driver.Open('/vsizip/' + zipfile, 0)
    layers = inDataSource.GetLayerCount()
    for lid in range(0,layers):
        inLayer = inDataSource.GetLayer(lid)
        print(inLayer.GetName())
    inLayer = inDataSource.GetLayer('Limite_Barrios_Zona_SER')
    print(inLayer.GetFeatureCount())

    bandasLayer = inDataSource.GetLayer('BANDAS_DE_APARCAMIENTO')
    print(bandasLayer.GetFeatureCount())

    silentremove(out_zonas_filename)
    geojson_driver = ogr.GetDriverByName("GeoJSON")
    outDataSource = geojson_driver.CreateDataSource(out_zonas_filename)

    crs84=osr.SpatialReference()
    crs84.SetFromUserInput('OGC:CRS84')
    utm30=osr.SpatialReference()
    utm30.SetFromUserInput('EPSG:32630')
    outLayer = outDataSource.CreateLayer("", srs=crs84, options=['COORDINATE_PRECISION=7'])

    (tmpoutLayer, tmpoutDS) = tempLayer('tmpout', crs84, options=['SHPT=POLYGON'])
    fld_CODDIS = ogr.FieldDefn('CODDIS', ogr.OFTString)
    tmpoutLayer.CreateField(fld_CODDIS)
    fld_NOMDIS = ogr.FieldDefn('NOMDIS', ogr.OFTString)
    tmpoutLayer.CreateField(fld_NOMDIS)
    fld_CODBAR = ogr.FieldDefn('CODBAR', ogr.OFTString)
    tmpoutLayer.CreateField(fld_CODBAR)
    fld_NOMBAR = ogr.FieldDefn('NOMBAR', ogr.OFTString)
    tmpoutLayer.CreateField(fld_NOMBAR)
    fld_name = ogr.FieldDefn('name', ogr.OFTString)
    tmpoutLayer.CreateField(fld_name)

    for inl in inLayer:
        if inl.GetFieldAsString('CODBAR') == '-':
            continue

        o = '../web/bandas_' + inl.GetFieldAsString('CODDIS') + inl.GetFieldAsString('CODBAR')+'.geojson'
        silentremove(o)
        outDataSourceClipped = geojson_driver.CreateDataSource(o)
        outLayerClipped = outDataSourceClipped.CreateLayer('', srs=crs84, options=['COORDINATE_PRECISION=7'])

        (tmpLayer, tmpDS) = tempLayer('tmp', utm30, options=['SHPT=ARC'])

        (memLayer, memDS) = tempLayer('clipper', utm30)

        memLayer.CreateFeature(inl)
        ogr.Layer.Clip(bandasLayer, memLayer, tmpLayer)
        print(tmpLayer.GetFeatureCount())
        fld_name = ogr.FieldDefn('zona', ogr.OFTString)
        tmpLayer.CreateField(fld_name)
        zona = '' + inl.GetFieldAsString('CODDIS') + inl.GetFieldAsString('CODBAR')

        for fid in range(tmpLayer.GetFeatureCount()):
            f = tmpLayer.GetFeature(fid)
            geo = f.GetGeometryRef()
            geo.TransformTo(crs84)
            f.SetField('zona', zona)
            outLayerClipped.CreateFeature(f)

        geo = inl.GetGeometryRef()
        geo.TransformTo(crs84)
        tmpoutLayer.CreateFeature(inl)

    for inl in tmpoutLayer:
        print(inl.GetFieldCount())
        name = inl.GetFieldAsString('CODDIS') + inl.GetFieldAsString('CODBAR') + ' - ' + inl.GetFieldAsString('NOMBAR')
        inl.SetField('name', name)
        outLayer.CreateFeature(inl)



def run(inputcsv, parquimetros, outputgeojson, encoding):
    featureColls = {}
    colors = {"077214010 Verde": "green", "043000255 Azul": "blue", "255000000 Rojo": "red",
              "255140000 Naranja": "orange", "081209246 Alta Rotación": "cyan"}

    with open(parquimetros, newline='', encoding=encoding) as csvfile:
        reader = csv.DictReader(csvfile, delimiter=';')
        for row in reader:
            if not row['gis_x']:
                continue
            point = getPoint(row)
            zona = getZona(row)
            calle = getCalle(row, 'num_finca')
            stroke = "black"
            if row['fecha_baja']:
                # print(row['fecha_alta'], row['fecha_baja'] , row['matricula'], zona, calle)
                continue
            feature = geojson.Feature(geometry=point, properties={
                "description": "Parquímetro " + row['matricula'] + "<br> " + calle + "<br> Zona: " + zona,
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
            calle = getCalle(row, 'num_finca')
            stroke = colors[row['color']]
            plazas = int(row['num_plazas'] or 0)
            desc = calle + "<br> plazas: " + str(plazas) + "<br> Zona: " + zona
            if row['color'].endswith('Alta Rotación'):
                desc += '<br> <a href="https://www.madrid360.es/buscador/?q=alta+rotaci%C3%B3n" target=_blank>Alta Rotación</a>'
            feature = geojson.Feature(geometry=point, properties={
                "description": desc,
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

    alta_rot = []
    for k, v in featureColls.items():
        for feat in v:
            if 'Alta Rotación' in feat.properties['description']:
                alta_rot.append(feat)
    with open(outputgeojson + "alta_rotacion.geojson", "w") as write_file:
        json.dump(geojson.FeatureCollection(alta_rot), write_file)

    zonas.sort()
    print("Zonas procesed: ", len(zonas))
    print(zonas)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Parsea los ficheros csv de plazas y parquímetros de la Zona SER Madrid.')
    parser.add_argument('-i', '--input', dest='zip',
                        default='../sources/BARRIOS_APARCAMIENTOS_SER.zip',
                        help='TODO')
    parser.add_argument('-p', '--parquimetros', dest='parquimetros',
                        default='../sources/Parquimetros_2023_08.csv',
                        help='fichero csv de parquímetros de la Zona SER Madrid')
    parser.add_argument('-o', '--output', dest='outputgeojson',
                        default='../web/plazas_zona_ser_',
                        help='fichero GeoJSON de salida')
    parser.add_argument('-e', '--encoding', dest='encoding',
                        default='latin-1',
                        help='encoding del fichero csv (default: UTF-8-sig)')

    # Files downloaded from
    # https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=4973b0dd4a872510VgnVCM1000000b205a0aRCRD
    # https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=65d85d6f40b86710VgnVCM2000001f4a900aRCRD

    args = parser.parse_args()
    # run(args.plazas, args.parquimetros, args.outputgeojson, args.encoding)
    out_zonas='../web/zonas_ser.geojson'
    run2(args.zip, args.parquimetros, args.outputgeojson, out_zonas)
