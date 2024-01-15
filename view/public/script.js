const socket = io();

// Manejar el evento 'connected' emitido desde el servidor
socket.on('connected', (message) => {
    console.log(message);
});

const button = document.getElementById('refresh-button');
const turnLCD = document.getElementById('turn-off');
const disableParticles = document.getElementById('disable-particles');
const disableTemperature = document.getElementById('disable-temperature');
const disableHumidity = document.getElementById('disable-humidity');
const restartDevice = document.getElementById('restart-device');

button.addEventListener('click', async () => {
    try {
        // Hacer una solicitud al servidor al hacer clic en el botón
        const response = await fetch('/getSensorsData');

        if (response.ok) {
            const responseData = await response.json();
            console.log('Respuesta del servidor:', responseData);
            
            document.getElementById('PPM').innerText = `${responseData.airQuality}`;
            document.getElementById('temperatureData').innerText = `${responseData.temperature}`;
            document.getElementById('humidity').innerText = `${responseData.humidity}`;
        } else {
            throw new Error('Error al obtener la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al hacer clic en el botón:', error);
    }
});