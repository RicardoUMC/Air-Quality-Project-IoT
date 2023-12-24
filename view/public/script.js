const socket = io();

// Manejar el evento 'connected' emitido desde el servidor
socket.on('connected', (message) => {
    console.log(message);
});

// Esta función hace una solicitud GET al servidor Express
async function getData() {
    try {
        const response = await fetch('/getQuality'); // Realiza la solicitud GET al servidor
        const data = await response.json(); // Obtiene los datos en formato JSON

        // Muestra los datos en la página HTML
        document.getElementById('PPM').innerText = `${data.quality} PPM`;
    } catch (error) {
        console.error('Error al obtener los datos de calidad:', error);
    }

    try {
        const response = await fetch('/getTemperature'); // Realiza la solicitud GET al servidor
        const data = await response.json(); // Obtiene los datos en formato JSON

        // Muestra los datos en la página HTML
        document.getElementById('temperatureData').innerText = `${data.temperature}°C`;
    } catch (error) {
        console.error('Error al obtener los datos de calidad:', error);
    }
}