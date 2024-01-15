const socket = io();

// Manejar el evento 'connected' emitido desde el servidor
socket.on('connected', (message) => {
    console.log(message);
});

const button = document.getElementById('refresh-button');
const toggleLCD = document.getElementById('toggle-lcd');
const toggleParticles = document.getElementById('toggle-particles');
const toggleTemperature = document.getElementById('toggle-temperature');
const toggleHumidity = document.getElementById('toggle-humidity');
const restartDevice = document.getElementById('restart-device');

button.addEventListener('click', async () => {
    try {
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

toggleLCD.addEventListener('click', async () => {
    try {
        const response = await fetch('/lcdBacklight');
        
        if (response.ok) {
            const responseData = await response.json();
            
            let span = document.getElementById('results');
            if (responseData.lcd) {
                toggleLCD.innerText = "Apagar LCD";
                span.innerText = "Pantalla LCD encendida";
            } else {
                toggleLCD.innerText = "Encender LCD";
                span.innerText = "Pantalla LCD apagada";
            }

        } else {
            throw new Error('Error al obtener la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al prender/apagar la pantalla LCD:', error);
    }
});

toggleParticles.addEventListener('click', async () => {
    try {
        const response = await fetch('/quality');

        if (response.ok) {
            const responseData = await response.json();

            let span = document.getElementById('results');
            if (responseData.ppm) {
                toggleParticles.innerText = "Deshabilitar PPM";
                span.innerText = "Lectura de PPM habilitada";
            } else {
                toggleParticles.innerText = "Habilitar PPM";
                span.innerText = "Lectura de PPM deshabilitada";
            }

        } else {
            throw new Error('Error al obtener la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al habilitar/deshabilitar lectura de PPM:', error);
    }
});

toggleTemperature.addEventListener('click', async () => {
    try {
        const response = await fetch('/temperature');

        if (response.ok) {
            const responseData = await response.json();

            let span = document.getElementById('results');
            if (responseData.lcd) {
                toggleParticles.innerText = "Deshabilitar PPM";
                span.innerText = "Lectura de PPM habilitada";
            } else {
                toggleParticles.innerText = "Habilitar PPM";
                span.innerText = "Lectura de PPM deshabilitada";
            }

        } else {
            throw new Error('Error al obtener la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al hacer clic en el botón:', error);
    }
});

toggleHumidity.addEventListener('click', async () => {
    try {
        const response = await fetch('/humidity');

        if (response.ok) {
            
        } else {
            throw new Error('Error al obtener la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al habilitar/deshabilitar el senseo de humedad:', error);
    }
});

restartDevice.addEventListener('click', async () => {
    try {
        const response = await fetch('/resetDevice');

        if (response.ok) {
            
        } else {
            throw new Error('Error al obtener la respuesta del servidor para el reinicio del dispositivo');
        }
    } catch (error) {
        console.error('Error al intentar reiniciar el dispositivo:', error);
    }
});