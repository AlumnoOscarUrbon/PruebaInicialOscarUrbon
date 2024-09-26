// Crear el mapa 
var map = L.map('map').setView([40.4165, -3.7026], 6);

// Añadir el mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Prueba inicial Oscar Urbon Risueño'
}).addTo(map);

// Almacenar los marcadores en un array
var markers = [];

// Asignar un emoji según el tipo de evento
function getEventEmoji(eventType) {
    const emojis = {
        'Wildfires': '🔥',      
        'Severe Storms': '🌪️', 
        'Volcanoes': '🌋',  
        'Sea and Lake Ice': '🧊', 
    };
    return emojis[eventType] || '❓';
}

// Función para cargar los eventos desde la API 
async function loadEONETEvents(startDate , endDate, count ) {
    // Limpiar los marcadores anteriores del mapa
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Formar URL de la API
    let url = 'https://eonet.gsfc.nasa.gov/api/v3/events';
    if (startDate && endDate && count) {
        url += `?start=${startDate}&end=${endDate}&limit=${count}`;
    }

    try {
        // Realizar la petición a la API de EONET
        const response = await fetch(url);
        const data = await response.json();
        console.log(data); // Imprimir la respuesta de la API en la consola para depuración
        const events = data.events || [];

        // Si no hay eventos, mostrar una alerta
        if (events.length === 0) {
            alert("No se encontraron eventos en las fechas seleccionadas.");
            return;
        }

        // Recorrer los eventos y añadirlos al mapa
        events.forEach(event => {

        // Comprobar que las coordenadas están en el formato correcto
            if (event.geometry && event.geometry.length > 0) {
                const coords = event.geometry[0].coordinates;
                if (coords.length === 2) {
                    const lat = coords[1]; 
                    const lon = coords[0]; 

                    // Crear un icono personalizado utilizando el emoji
                    const emoji = getEventEmoji(event.categories[0].title);
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
                            <a href="${event.sources && event.sources[0] ? event.sources[0].url : '#'}" target="_blank">Más información</a>
                        </div>
                    `);

                    // Añadir el marcador al mapa y al array de marcadores
                    marker.addTo(map);
                    markers.push(marker);
                }
            }
        });
    } catch (error) {
        console.error('Error al cargar los eventos de EONET:', error);
    }
}

// Cargar eventos por defecto al cargar la página
window.onload = function() {
    loadEONETEvents();
};

// Envío del formulario
document.getElementById('date-form').addEventListener('submit', function(e) {
    e.preventDefault(); 

    // Obtener las fechas seleccionadas
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const count = document.getElementById('event-count').value;

    loadEONETEvents(startDate, endDate, count);
});

// Función para manejar el botón "Eliminar Filtro"
document.getElementById('clear-filter').addEventListener('click', function() {

    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    document.getElementById('event-count').value = '#'; 

    loadEONETEvents();
});
