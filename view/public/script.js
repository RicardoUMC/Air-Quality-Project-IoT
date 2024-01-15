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
const toggleActuators = document.getElementById('toggle-actuators');
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
            if (responseData.qualityState) {
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
            if (responseData.temperatureState) {
                toggleTemperature.innerText = "Deshabilitar temperatura";
                span.innerText = "Lectura de temperatura habilitada";
            } else {
                toggleTemperature.innerText = "Habilitar temperatura";
                span.innerText = "Lectura de temperatura deshabilitada";
            }

        } else {
            throw new Error('Error al obtener la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al habilitar/deshabilitar lectura de temperatura:', error);
    }
});

toggleHumidity.addEventListener('click', async () => {
    try {
        const response = await fetch('/humidity');

        if (response.ok) {
            const responseData = await response.json();

            let span = document.getElementById('results');
            if (responseData.humidityState) {
                toggleHumidity.innerText = "Deshabilitar humedad";
                span.innerText = "Lectura de humedad habilitada";
            } else {
                toggleHumidity.innerText = "Habilitar humedad";
                span.innerText = "Lectura de humedad deshabilitada";
            }

        } else {
            throw new Error('Error al obtener la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al habilitar/deshabilitar lectura de humedad:', error);
    }
});

toggleActuators.addEventListener('click', async () => {
    try {
        const response = await fetch('/actuators');

        if (response.ok) {
            const responseData = await response.json();

            let span = document.getElementById('results');
            if (responseData.actuatorsState) {
                toggleActuators.innerText = "Deshabilitar actuadores";
                span.innerText = "Actuadores habilitados";
            } else {
                toggleActuators.innerText = "Habilitar actuadores";
                span.innerText = "Actuadores deshabilitados";
            }

        } else {
            throw new Error('Error al obtener la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al habilitar/deshabilitar los actuadores:', error);
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