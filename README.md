# Zona-SER-Madrid

Herramienta para ver online las distintas plazas de aparcamiento de la Zona SER de Madrid por colores, la ubicación de los parquímetros, y las distintas zonas.

Visor web: https://jjimenezshaw.github.io/Zona-SER-Madrid/web/

El código en Python para convertir los csv con coordenadas en UTM30 a GeoJSON también está disponible.

## Origen de los datos
Los datos de las plazas y parquímetros las he descargado de la página del ayuntamiento ["Zonas SER. Distintivos y parquímetros"](https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=4973b0dd4a872510VgnVCM1000000b205a0aRCRD)

El fichero GeoJSON con las 48 zonas detalladas las he creado a mano, ayudado de datos de los barrios ("Divisiones administrativas: distritos, barrios y divisiones históricas" en la web del ayuntamiento) y alguna página web. Por tanto puede tener errores. Lamentablemente el ayuntamiento no tiene disponible en su web un fichero en formato geográfico (shp, kml, geojson, ...) con las distintas zonas. Lo he solicitado, y la respuesta fue "La unidad responsable nos informa de que actualmente no se encuentra disponible la información que requiere."

Esta web no puede ser usada como fuente inequívoca para temas jurídicos. En ese caso póngase en contacto con el ayuntamiento directamente

## Visor web
El visor web hecho con [Leaflet](https://leafletjs.com/) muestra inicialmente las 48 zonas marcadas en violeta. Haciendo click en cualquiera de ellas mostrará puntos verdes y azules para las plazas de aparcamiento, y negros para los parquímetros. Al hacer click en los puntos se muestra un diálogo con información del mismo. La información dada por del ayuntamiento sólo son coordendas de un punto y número de plazas (y algún dato más). Desgraciadamente no hay coordenadas del área que cubren esas plazas. Por ese motivo se representan como un círculo, y no una línea o rectángulo. El tamaño de los puntos es proporcional al número de plazas.
Los "Ámbitos Diferenciados del Servicio de Estacionamiento Regulado" en algunas zonas están marcados con plazas "rojas" (zona especial de La Paz) y "naranjas" (Templo de Debod y Cuesta de la Vega)
