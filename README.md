# Zona-SER-Madrid

Herramienta para ver online las distintas zonas de la Zona SER de Madrid, sus plazas de aparcamiento por colores y la ubicación de los parquímetros en un mapa.

Visor web: https://jjimenezshaw.github.io/Zona-SER-Madrid/web/

## Servicio de Estacionamiento Regulado (SER)
Madrid tiene desde hace años limitado el aparcamiento de vehículos dentro de (más o menos) la M-30. Los vecinos pueden aparcar (previo pago de una tarifa) en su zona en las plazas verdes. Así mismo, los tickets de estacionamiento para el resto están limitados para una zona específica y color. Visite la web del ayuntamiento para ver las condiciones de aparcamiento dependiendo del color de la plaza.

Este visor web pretende facilitar la ubicación de las plazas por colores y parquímetros dentro de la Zona SER de Madrid de una forma ágil en un mapa interactivo.

![image](https://user-images.githubusercontent.com/534414/116054093-a0915780-a67b-11eb-8e73-2577726a5d54.png)

## Origen de los datos
Los datos de las plazas y parquímetros las he descargado de las páginas del ayuntamiento ["Servicio de Estacionamiento Regulado (SER). Calles y número de plazas"](https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=4973b0dd4a872510VgnVCM1000000b205a0aRCRD) y ["Servicio de Estacionamiento Regulado (SER). Parquímetros"](https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=65d85d6f40b86710VgnVCM2000001f4a900aRCRD). Los encontrará en la carpeta [sources](sources).

El fichero GeoJSON con las 49 zonas detalladas lo he creado a mano, ayudado de datos de los barrios ("Divisiones administrativas: distritos, barrios y divisiones históricas" en la web del ayuntamiento) y alguna otra página web. Por tanto puede tener errores. Lamentablemente el ayuntamiento no tiene disponible en su web un fichero en formato geográfico (shp, kml, geojson, ...) con las distintas zonas. Lo he solicitado (como otra gente antes), y la respuesta ha sido "La unidad responsable nos informa de que actualmente no se encuentra disponible la información que requiere".

Esta web no puede ser usada como fuente inequívoca para temas jurídicos. En ese caso póngase en contacto con el ayuntamiento directamente. Es meramente de consulta, y no está mantenida por el ayuntamiento de Madrid ni por ningún organismo público.

## Visor web
El visor web hecho con [Leaflet](https://leafletjs.com/) muestra inicialmente las 49 zonas marcadas en violeta. Haciendo click en cualquiera de ellas mostrará puntos verdes y azules para las plazas de aparcamiento, y negros para los parquímetros. Al hacer click en los puntos se muestra un diálogo con información del mismo. 

La información dada por del ayuntamiento sólo son coordendas de un punto y número de plazas (y algún dato más). Desgraciadamente no hay coordenadas del área que cubren esas plazas. Por ese motivo se representan como un círculo, y no una línea o rectángulo. El tamaño de los puntos es proporcional al número de plazas.

Los "Ámbitos Diferenciados del Servicio de Estacionamiento Regulado" están marcados con plazas "rojas" (zona especial de La Paz) y "naranjas" (Templo de Debod y Cuesta de la Vega). Las plazas "cyan" son de Alta Rotación.

No se muestran todas las plazas inicialmente para no ralentizar el navegador. Seleccione sólo las zonas que le interesen para que la experiencia sea fluida.

## Actualización de datos
La versión actual está hecha en abril de 2022. A esta fecha no se han publicado aún en la web del ayuntamiento las zonas Puerta del Ángel y Los Cármenes.

## Conversor en Python
Para convertir los datos iniciales del ayuntamiento (en formato csv) a un formato geográfico estandar (GeoJSON), hay un script en la carpeta [src](src). 

## Licencia
Todo el contenido original de este repositorio está bajo la licencia [BSD-3-Clause](LICENSE).
