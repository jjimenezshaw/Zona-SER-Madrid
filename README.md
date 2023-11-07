# Zona-SER-Madrid

Herramienta para ver online las distintas zonas de la Zona SER de Madrid, sus plazas de aparcamiento por colores y la ubicación de los parquímetros en un mapa.

Visor web: https://jjimenezshaw.github.io/Zona-SER-Madrid/web/

## Servicio de Estacionamiento Regulado (SER)
Madrid tiene desde hace años limitado el aparcamiento de vehículos dentro de (más o menos) la M-30. Los vecinos pueden aparcar (previo pago de una tarifa) en su zona en las plazas verdes. Así mismo, los tickets de estacionamiento para el resto están limitados para una zona específica y color. Visite la web del ayuntamiento para ver las condiciones de aparcamiento dependiendo del color de la plaza.

Este visor web pretende facilitar la ubicación de las plazas por colores y parquímetros dentro de la Zona SER de Madrid de una forma ágil en un mapa interactivo.

![image](https://user-images.githubusercontent.com/534414/116054093-a0915780-a67b-11eb-8e73-2577726a5d54.png)

## Origen de los datos
Los datos de las zonas, plazas y parquímetros las he descargado de las páginas del ayuntamiento ["Servicio de Estacionamiento Regulado (SER)"](https://geoportal.madrid.es/IDEAM_WBGEOPORTAL/dataset.iam?id=9506daa5-e317-11ec-8359-60634c31c0aa). Se ha utilizado el ficheron en formato SHP. Los encontrará en la carpeta [sources](sources).

Esta web no puede ser usada como fuente inequívoca para temas jurídicos. En ese caso póngase en contacto con el ayuntamiento directamente. Es meramente de consulta, y no está mantenida por el ayuntamiento de Madrid ni por ningún organismo público.

## Visor web
El visor web hecho con [Leaflet](https://leafletjs.com/) muestra inicialmente las 61 zonas marcadas en violeta. Haciendo click en cualquiera de ellas mostrará líneas verdes y azules (y otros colores extra) para las plazas de aparcamiento, y puntos negros para los parquímetros. Al hacer click en los elementos se muestra un diálogo con información del mismo.

Los "Ámbitos Diferenciados del Servicio de Estacionamiento Regulado" están marcados con plazas "rojas" (zona especial de La Paz) y "naranjas" (Templo de Debod y Cuesta de la Vega). Las plazas "cyan" son de Alta Rotación.

No se muestran todas las plazas inicialmente para no ralentizar el navegador. Seleccione sólo las zonas que le interesen para que la experiencia sea fluida.

## Actualización de datos
La versión actual está hecha el 7 de noviembre de 2023.

## Conversor en Python
Para convertir los datos iniciales del ayuntamiento (en formato shp) a un formato geográfico estandar (GeoJSON), hay un script en la carpeta [src](src).

## Licencia
Todo el contenido original de este repositorio está bajo la licencia [BSD-3-Clause](LICENSE).
