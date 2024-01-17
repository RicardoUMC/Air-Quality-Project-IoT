const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const model = require('../model/model.js');

app.use(express.static(path.join(__dirname, '../view/public/')));

// Ruta principal para cargar la vista
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../view/public/index.html'));
});

/* The `app.get('/getSensorsData', async (req, res) => { ... })` function is a route handler for the
GET request to the '/getSensorsData' endpoint. */
app.get('/getSensorsData', async (req, res) => {
    try {
        const airQualityResponse = await model.getQualityData('/getQuality')        
        const temperatureResponse = await model.getTemperatureData('/getTemperature')        
        const humidityResponse = await model.getHumidityData('/getHumidity')

        model.consoleTime(`Particulas en el ambiente: ${airQualityResponse}`);
        model.consoleTime(`Temperatura: ${temperatureResponse}`);
        model.consoleTime(`Humedad: ${humidityResponse}`);

        const processedData = await model.formatDataToJSON(
            airQualityResponse,
            temperatureResponse,
            humidityResponse
        );
        
        // Enviar los datos procesados como respuesta en formato JSON
        res.json(processedData);
    } catch (error) {
        model.consoleTime(`Error en la obtención de datos: ${error}`);
        res.status(500).json({ error: 'Ocurrió un error al obtener el de los sensores' });
    }
});

/* The `app.get('/lcdBacklight', async (req, res) => { ... })` function is a route handler for the GET
request to the '/lcdBacklight' endpoint. */
app.get('/lcdBacklight', async (req, res) => {
    const state = await model.toggleLCD(req.path);
    res.json({ lcd: state });
});

/* The `app.get('/quality', async (req, res) => { ... })` function is a route handler for the GET
request to the '/quality' endpoint. */
app.get('/quality', async (req, res) => {
    const state = await model.toggleQuality(req.path);
    res.json({ qualityState: state });
});

/* The `app.get('/temperature', async (req, res) => { ... })` function is a route handler for the GET
request to the '/temperature' endpoint. */
app.get('/temperature', async (req, res) => {
    const state = await model.toggleTemperature(req.path);
    res.json({ temperatureState: state });
});

/* The `app.get('/humidity', async (req, res) => { ... })` function is a route handler for the GET
request to the '/humidity' endpoint. */
app.get('/humidity', async (req, res) => {
    const state = await model.toggleHumidity(req.path);
    res.json({ humidityState: state });
});

/* The `app.get('/actuators', async (req, res) => { ... })` function is a route handler for the GET
request to the '/actuators' endpoint. */
app.get('/actuators', async (req, res) => {
    const state = await model.toggleActuators(req.path);
    res.json({ actuatorsState: state });
});

/* The `app.get('/resetDevice', async (req, res) => { ... })` function is a route handler for the GET
request to the '/resetDevice' endpoint. */
app.get('/resetDevice', async (req, res) => {
    const messageText = await model.resetDevice(req.path);
    res.json({ message: messageText });
});

/* The code `io.on('connection', (socket) => { ... })` is an event listener that listens for a
connection event from a client. When a client connects to the server, the callback function is
executed. */
io.on('connection', (socket) => {
    model.consoleTime("Usuario conectado");

    // Mensaje de registro para verificar eventos
    socket.emit('connected', 'Conexión establecida con el servidor');

    socket.on('disconnect', () => {
        model.consoleTime("Usuario desconectado");
    });
});

/* The code `const PORT = 8080; http.listen(PORT, () => { console.log(`Servidor escuchando en el puerto
`); });` is setting up the server to listen on port 8080. */
const PORT = 8080;
http.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
