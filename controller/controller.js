const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const model = require('../model/model.js');

app.use(express.static(path.join(__dirname, '../view/public/')));

// Ruta para manejar las solicitudes POST de datos de sensores desde la ESP32
app.post('/', (req, res) => {
    const airQuality = parseInt(req.body.airQuality);
    const temperature = parseFloat(req.body.temperature);

    console.log(`QUAL:${airQuality}`);
    console.log(`TEMP:${temperature}`);

    // Puedes procesar los datos recibidos como lo necesites aquí
    // Por ejemplo, llamar al modelo o realizar otras operaciones

    // Ejemplo de envío de respuesta
    res.status(200).json({ message: 'Datos recibidos correctamente' });
});

// Ruta principal para cargar la vista
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../view/public/index.html'));
});

// Rutas GET
app.get('/getSensorsData', async (req, res) => {
    try {
        const airQualityResponse = await model.getQualityData()        
        const temperatureResponse = await model.getTemperatureData()        
        const humidityResponse = await model.getHumidityData()

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
        res.status(500).json({ error: 'Ocurrió un error al obtener los valores' });
    }
});

// Al conectar un usuario
io.on('connection', (socket) => {
    model.consoleTime("Usuario conectado");

    // Mensaje de registro para verificar eventos
    socket.emit('connected', 'Conexión establecida con el servidor');

    socket.on('disconnect', () => {
        model.consoleTime("Usuario desconectado");
    });
});

// Verificar la conexión del servidor a un puerto específico
const PORT = 8080;
http.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
