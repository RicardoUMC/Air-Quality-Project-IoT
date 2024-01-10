const socket = io();

// Manejar el evento 'connected' emitido desde el servidor
socket.on('connected', (message) => {
    console.log(message);
});

const button = document.getElementById('refresh-button');

button.addEventListener('click', async () => {
    try {
        // Hacer una solicitud al servidor al hacer clic en el botón
        const response = await fetch('/getSensorsData');

        if (response.ok) {
            const responseData = await response.json();
            console.log('Respuesta del servidor:', responseData);
            
            document.getElementById('PPM').innerText = `${responseData.airQuality} PPM`;
            document.getElementById('temperatureData').innerText = `${responseData.temperature}°C`;
            document.getElementById('humidity').innerText = `${responseData.humidity}%`;
        } else {
            throw new Error('Error al obtener la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al hacer clic en el botón:', error);
    }
});