#! /bin/bash

SRC=../sources
DST=../web
TOTAL=$SRC/total.gpkg
rm $TOTAL
rm $SRC/crosses.geojson
rm $DST/zonas.geojson
rm $DST/calles.geojson
rm $SRC/parquimetros.geojson

ogr2ogr -f gpkg $TOTAL /vsizip/$SRC/BARRIOS_APARCAMIENTOS_SER.zip
ogrinfo $TOTAL -sql "ALTER TABLE Limite_Barrios_Zona_SER ADD COLUMN zona Text"
ogrinfo $TOTAL -sql "ALTER TABLE Limite_Barrios_Zona_SER ADD COLUMN name Text"
ogrinfo $TOTAL -dialect SQLite -sql "UPDATE Limite_Barrios_Zona_SER SET zona = CODDIS||CODBAR"
#ogrinfo $TOTAL -dialect SQLite -sql "UPDATE Limite_Barrios_Zona_SER SET name = NOMDIS||' - '||NOMBAR"
ogrinfo $TOTAL -dialect SQLite -sql "UPDATE Limite_Barrios_Zona_SER SET name = zona||' - '||NOMBAR"

ogrinfo $TOTAL -sql "ALTER TABLE PARQUIMETROS ADD COLUMN zona Text"
ogrinfo $TOTAL -sql "ALTER TABLE PARQUIMETROS ADD COLUMN description Text"
ogrinfo $TOTAL -dialect SQLite -sql "UPDATE PARQUIMETROS SET zona = ltrim(substr(BARRIO, 1, 2),'0')||ltrim(substr(BARRIO, 4, 2),'0')"
ogrinfo $TOTAL -dialect SQLite -sql "UPDATE PARQUIMETROS SET description = 'Parquímetro: ' || MATRICULA || '<br>' || CALLE || ', ' || NUMERO || '<br>Zona: ' || zona"

ogrinfo $TOTAL -sql "ALTER TABLE BANDAS_DE_APARCAMIENTO ADD COLUMN description Text"
ogrinfo $TOTAL -dialect SQLite -sql "UPDATE BANDAS_DE_APARCAMIENTO SET description = 'Aparcamiento: ' || Bateria_Li || '<br>Plazas: ' || Res_NumPla  || '<br>Color: ' || Color"


# https://spatialthoughts.com/2015/07/12/ogr-spatial-join/
# https://www.gaia-gis.it/gaia-sins/spatialite-sql-4.2.0.html
ogr2ogr $DST/zonas.geojson $TOTAL -t_srs EPSG:4326 -lco COORDINATE_PRECISION=7 Limite_Barrios_Zona_SER -nln zonas
ogr2ogr $SRC/parquimetros.geojson $TOTAL -t_srs EPSG:4326 -lco COORDINATE_PRECISION=7 PARQUIMETROS -nln data
ogr2ogr $DST/calles.geojson $TOTAL -sql "SELECT b.*, l.zona from BANDAS_DE_APARCAMIENTO b, Limite_Barrios_Zona_SER l WHERE ST_INTERSECTS(b.geom, l.geom)" -dialect SQLITE -t_srs EPSG:4326 -lco COORDINATE_PRECISION=7 -nln data
ogr2ogr -f GeoJSON -append $DST/calles.geojson $SRC/parquimetros.geojson

# crosses: están en dos zonas!
ogr2ogr $SRC/crosses.geojson $TOTAL -sql "SELECT b.*, l.zona from BANDAS_DE_APARCAMIENTO b, Limite_Barrios_Zona_SER l WHERE ST_CROSSES(b.geom, l.geom)" -dialect SQLITE -t_srs EPSG:4326 -lco COORDINATE_PRECISION=7 -nln crosses

# decimal separator
#sed -i -E 's/([0-9]),([0-9])/\1.\2/g' Parquimetros_2023_10.csv
# Zona attribute
#sed -i -E 's/;barrio;/;zona;/g' Parquimetros_2023_10.csv
#sed -i -E 's/;0?([0-9]{1,2})-0?([0-9]{1,2})[^;]*/;\1\2/' Parquimetros_2023_10.csv

#ogr2ogr parquimetros.geojson Parquimetros_2023_10.csv -t_srs EPSG:4326 -lco COORDINATE_PRECISION=7 -oo X_POSSIBLE_NAMES=gis_x -oo Y_POSSIBLE_NAMES=gis_y  -s_srs EPSG:25830 -oo KEEP_GEOM_COLUMNS=NO -nln parquimetros
