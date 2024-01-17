/* The line `const socket = io();` is initializing a WebSocket connection using the `io()` function.
This allows the client to establish a real-time, bidirectional communication channel with the
server. The `socket` object can be used to send and receive messages between the client and server. */
const socket = io();

/* The code is setting up an event listener for the 'connected' event on the WebSocket connection. */
socket.on('connected', (message) => {
    console.log(message);
});

/* These lines of code are retrieving references to HTML elements with specific IDs using the
`document.getElementById()` method. */
const button = document.getElementById('refresh-button');
const toggleLCD = document.getElementById('toggle-lcd');
const toggleParticles = document.getElementById('toggle-particles');
const toggleTemperature = document.getElementById('toggle-temperature');
const toggleHumidity = document.getElementById('toggle-humidity');
const toggleActuators = document.getElementById('toggle-actuators');
const restartDevice = document.getElementById('restart-device');

/* The `button.addEventListener('click', async () => { ... })` code block is adding an event listener
to the `button` element. When the button is clicked, the code inside the event listener will be
executed. */
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

/* The `toggleLCD.addEventListener('click', async () => { ... })` code block is adding an event
listener to the `toggleLCD` element. When the element is clicked, the code inside the event listener
will be executed. */
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

/* The `toggleParticles.addEventListener('click', async () => { ... })` code block is adding an event
listener to the `toggleParticles` element. When the element is clicked, the code inside the event
listener will be executed. */
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

/* The `toggleTemperature.addEventListener('click', async () => { ... })` code block is adding an event
listener to the `toggleTemperature` element. When the element is clicked, the code inside the event
listener will be executed. */
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

/* The `toggleHumidity.addEventListener('click', async () => { ... })` code block is adding an event
listener to the `toggleHumidity` element. When the element is clicked, the code inside the event
listener will be executed. */
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

/* The `toggleActuators.addEventListener('click', async () => { ... })` code block is adding an event
listener to the `toggleActuators` element. When the element is clicked, the code inside the event
listener will be executed. */
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

/* The code block `restartDevice.addEventListener('click', async () => { ... })` is adding an event
listener to the `restartDevice` element. When the element is clicked, the code inside the event
listener will be executed. */
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