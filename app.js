document.addEventListener("DOMContentLoaded", function () {
    // Inicializar el mapa
    var map = L.map('map').setView([40.4637, -3.7492], 10); // Centrado en España con zoom 6

    // Añadir una capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var markers = []; // Almacenará los marcadores actuales

    // Función para agregar marcadores al mapa
    // Función para agregar marcadores al mapa
function addMarkers(data, userLocation) {
    // Limpiar marcadores anteriores
    markers.forEach(function (marker) {
        map.removeLayer(marker);
    });
    markers = [];

    // Obtener el término de búsqueda
    var searchTerm = document.getElementById('search').value.toLowerCase();

    // Añadir nuevos marcadores que coincidan con la búsqueda
    data.features.forEach(function (feature) {
        var properties = feature.properties;
        var coordinates = feature.geometry.coordinates;

        // Filtrar por nombre o localidad
        var matchesSearch = properties.NOMBRE.toLowerCase().includes(searchTerm) ||
            properties.LOCALIDAD.toLowerCase().includes(searchTerm);
        var isNearby = true;

        // Si hay una ubicación del usuario, calcular la distancia
        if (userLocation) {
            var distance = calculateDistance(userLocation, [coordinates[1], coordinates[0]]);
            isNearby = distance <= 10; // Mostrar solo los puntos dentro de 10 km
        }

        if (matchesSearch && isNearby) {
            var marker = L.marker([coordinates[1], coordinates[0]]).addTo(map);
            var googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`;

            marker.bindPopup(`
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
                    <h2 style="font-size: 16px; margin: 0; color: #0f1b28;">${properties.NOMBRE}</h2>
                    <p style="margin: 8px 0; color: #555;">
                        ${properties.DIRECCION}<br>
                        ${properties.LOCALIDAD}, ${properties.REGION}
                    </p>
                    <p style="margin: 8px 0; color: #777;">
                        <a href="http://${properties.WEB}" target="_blank" style="color: #1e90ff; text-decoration: none;">
                            ${properties.WEB}
                        </a>
                    </p>
                    <p style="margin: 8px 0; color: #777; font-style: italic;">
                        ${properties.COMENTARIOA}<br>
                        ${properties.COMENTARIOB}
                    </p>
                    <a href="${googleMapsUrl}" target="_blank" style="
                        display: inline-block;
                        padding: 10px 15px;
                        background-color: #0f1b28;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        text-align: center;
                        margin-top: 10px;
                        font-weight: bold;
                    ">
                        Ver en Google Maps
                    </a>
                </div>
            `);
            

            markers.push(marker); // Guardar el marcador
        }
    });

    // Si no hay resultados y hay una búsqueda activa, centrar el mapa en la vista inicial
    if (markers.length === 0 && searchTerm) {
        map.setView([51.509169, -0.0632201], 10); // Centrar en Londres como vista predeterminada
    }
}


    // Función para calcular la distancia entre dos puntos (Haversine formula)
    function calculateDistance(coord1, coord2) {
        var R = 6371; // Radio de la Tierra en km
        var dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
        var dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distancia en km
    }

    // Función para cambiar el conjunto de datos
    function updateMap(userLocation = null) {
        var selectedData = document.getElementById('dataSet').value;

        if (selectedData === 'franquicia') {
            addMarkers(franquicia, userLocation);
        } else if (selectedData === 'obrador') {
            addMarkers(obrador, userLocation);
        } else if (selectedData === 'restaurante') {
            addMarkers(restaurante, userLocation);
        } else if (selectedData === 'heladeria') {
            addMarkers(heladeria, userLocation);
        } else if (selectedData === 'tienda') {
            addMarkers(tienda, userLocation);
        } else if (selectedData === 'barcafeteria') {
            addMarkers(barcafeteria, userLocation);
        } else if (selectedData === 'cafeteriaobrador') {
            addMarkers(cafeteriaobrador, userLocation);
        } else if (selectedData === 'takeaway') {
            addMarkers(takeaway, userLocation);
        }
    }

    // Función para mostrar sugerencias de búsqueda
    function showSuggestions(data) {
        var searchTerm = document.getElementById('search').value.toLowerCase();
        var suggestionsDiv = document.getElementById('suggestions');
        suggestionsDiv.innerHTML = ''; // Limpiar sugerencias anteriores

        // No mostrar sugerencias si el término de búsqueda está vacío
        if (searchTerm.length === 0) {
            return;
        }

        data.features.forEach(function (feature) {
            var properties = feature.properties;

            // Filtrar por nombre o localidad
            if (properties.NOMBRE.toLowerCase().includes(searchTerm) ||
                properties.LOCALIDAD.toLowerCase().includes(searchTerm)) {

                var suggestion = document.createElement('div');
                suggestion.textContent = `${properties.NOMBRE}, ${properties.LOCALIDAD}`;
                suggestion.addEventListener('click', function () {
                    var coordinates = feature.geometry.coordinates;
                    map.setView([coordinates[1], coordinates[0]], 15); // Zoom en el punto seleccionado
                    L.popup()
                        .setLatLng([coordinates[1], coordinates[0]])
                        .setContent(`<strong>${properties.NOMBRE}</strong><br>${properties.DIRECCION}<br>${properties.LOCALIDAD}, ${properties.REGION}`)
                        .openOn(map);
                    suggestionsDiv.innerHTML = ''; // Limpiar sugerencias después de la selección
                });
                suggestionsDiv.appendChild(suggestion);
            }
        });
    }

    // Evento para cambiar el conjunto de datos
    document.getElementById('dataSet').addEventListener('change', function () {
        updateMap();
    });

    // Evento para buscar por nombre o localidad
    document.getElementById('search').addEventListener('input', function () {
        var selectedData = document.getElementById('dataSet').value;

        if (selectedData === 'franquicia') {
            showSuggestions(franquicia);
        } else if (selectedData === 'obrador') {
            showSuggestions(obrador);
        } else if (selectedData === 'restaurante') {
            showSuggestions(restaurante);
        } else if (selectedData === 'heladeria') {
            showSuggestions(heladeria);
        } else if (selectedData === 'tienda') {
            showSuggestions(tienda);
        } else if (selectedData === 'barcafeteria') {
            showSuggestions(barcafeteria);
        } else if (selectedData === 'cafeteriaobrador') {
            showSuggestions(cafeteriaobrador);
        } else if (selectedData === 'takeaway') {
            showSuggestions(takeaway);
        }
    });

    // Evento para buscar cerca de la ubicación del usuario
    document.getElementById('findMe').addEventListener('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var userLocation = [position.coords.latitude, position.coords.longitude];
                map.setView(userLocation, 12); // Centrar el mapa en la ubicación del usuario
                updateMap(userLocation); // Actualizar el mapa mostrando solo los lugares cercanos
            }, function () {
                alert("No se pudo obtener la ubicación.");
            });
        } else {
            alert("Geolocalización no es soportada por este navegador.");
        }
    });

    // Cargar el mapa inicialmente con las franquicias
    updateMap();
});