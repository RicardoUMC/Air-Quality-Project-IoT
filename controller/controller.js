const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const moment = require('moment');
const sensorModel = require('../model/model.js');

app.use(express.static(__dirname));

// Middleware para analizar application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

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

app.get('/getQuality', async (req, res) => {
    console.log(`PATH: GET ${req.path}`);
    try {
        const response = await axios.get('http://192.168.0.180:80/' + req.path);
        const qualityData = response.data; // Suponiendo que la respuesta contiene los datos de calidad
        console.log(`Calidad: ${qualityData} PPM`);

        // Aquí podrías hacer algo con los datos obtenidos, como pasarlo al módulo Modelo (MVC)
        // Por ejemplo, podrías enviarlos como respuesta a la solicitud GET
        res.json({ quality: qualityData });
    } catch (error) {
        console.error('Error al obtener la calidad:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener la calidad' });
    }
});

app.get('/getTemperature', async (req, res) => {
    console.log(`PATH: GET ${req.path}`);
    try {
        const response = await axios.get('http://192.168.0.180:80/' + req.path); // Cambiar la ruta según tu API local
        const temperatureData = response.data; // Suponiendo que la respuesta contiene los datos de temperatura
        console.log(`Temperatura: ${temperatureData} °C`);

        // Aquí podrías hacer algo con los datos obtenidos, como pasarlo al módulo Modelo (MVC)
        // Por ejemplo, podrías enviarlos como respuesta a la solicitud GET
        res.json({ temperature: temperatureData });
    } catch (error) {
        console.error('Error al obtener la temperatura:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener la temperatura' });
    }
});

// Al conectar un usuario
io.on('connection', (socket) => {
    const time = moment().format('YYYY-MM-DD HH:mm:ss'); // Formato de fecha y hora deseado
    console.log(`[${time}] Usuario conectado`);

    // Mensaje de registro para verificar eventos
    socket.emit('connected', 'Conexión establecida con el servidor');

    socket.on('disconnect', () => {
        const disconnectTime = moment().format('YYYY-MM-DD HH:mm:ss'); // Hora de desconexión
        console.log(`[${disconnectTime}] Usuario desconectado`);
    });
});

// Verificar la conexión del servidor a un puerto específico
const PORT = 8080;
http.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
