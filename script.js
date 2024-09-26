// script.js 
// Crear el mapa centrado en una ubicación predeterminada
var map = L.map('map').setView([0, 0], 2);

// Añadir el mapa base de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Almacenar los marcadores en un array
var markers = [];

// Función para asignar un emoji según el tipo de evento
function getEventEmoji(eventType) {
    const emojis = {
        'Wildfires': '🔥',      // Incendios
        'Severe Storms': '🌪️', // Tormentas severas
        'Volcanoes': '🌋',      // Volcanes
        'Earthquakes': '🌍',    // Terremotos
        'Floods': '🌊',         // Inundaciones
        'Landslides': '🏔️',    // Deslizamientos
        'Tropical Cyclones': '🌀', // Ciclones tropicales
        'Drought': '🌵',        // Sequía
        'Snow': '❄️',          // Nieve
        'Dust and Haze': '🌫️', // Polvo y neblina
        'Manmade': '🏗️',       // Eventos hechos por el hombre
        'Icebergs': '🧊',       // Icebergs
    };
    return emojis[eventType] || '❓'; // Devuelve un emoji de interrogación si no se encuentra el tipo
}

// Función para cargar los eventos desde la API de EONET con rango de fechas
async function loadEONETEvents(startDate, endDate) {
    // Limpiar los marcadores anteriores
    markers.forEach(marker => map.removeLayer(marker));
    markers = []; // Limpiar el array de marcadores

    let url = 'https://eonet.gsfc.nasa.gov/api/v3/events';

    // Si se han proporcionado fechas de inicio y fin, añadimos estos parámetros a la URL
    if (startDate && endDate) {
        url += `?start=${startDate}&end=${endDate}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        const events = data.events || []; // Asegurarse de que hay eventos

        if (events.length === 0) {
            alert("No se encontraron eventos en las fechas seleccionadas.");
            return; // Salir si no hay eventos
        }

        events.forEach(event => {
            if (event.geometry && event.geometry.length > 0) {
                const coords = event.geometry[0].coordinates;
                const lat = coords[1];
                const lon = coords[0];

                // Obtener el emoji correspondiente al tipo de evento
                const eventType = event.categories[0].title;
                const emoji = getEventEmoji(eventType);

                // Crear un icono personalizado utilizando el emoji
                const emojiIcon = L.divIcon({
                    className: 'emoji-icon',
                    html: `<div>${emoji}</div>`,
                    iconSize: [64, 64],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });

                // Crear un marcador
                const marker = L.marker([lat, lon], { icon: emojiIcon });

                // Añadir un popup al marcador con detalles del evento
                marker.bindPopup(`
                    <div class="event-popup">
                        <strong>${emoji} ${event.title}</strong><br>
                        <p>${event.description ? event.description : 'No description available'}</p>
                        <a href="${event.sources[0].url}" target="_blank">Más información</a>
                    </div>
                `);

                // Añadir el marcador al mapa y al array
                marker.addTo(map);
                markers.push(marker); // Guardar el marcador en el array
            }
        });

    } catch (error) {
        console.error('Error al cargar los eventos de EONET:', error);
    }
}

// Función para manejar el envío del formulario
document.getElementById('date-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Evita el envío del formulario por defecto

    // Obtener las fechas seleccionadas
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    // Cargar los eventos según el rango de fechas seleccionado
    if (startDate && endDate) {
        loadEONETEvents(startDate, endDate);
    } else {
        alert("Por favor, selecciona ambas fechas.");
    }
});

// Función para manejar el botón "Eliminar Filtro"
document.getElementById('clear-filter').addEventListener('click', function() {
    // Limpiar los campos de fecha
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';

    // Cargar todos los eventos sin filtro
    loadEONETEvents();
});

// Cargar eventos por defecto (sin filtro de fechas) cuando se carga la página
loadEONETEvents();
