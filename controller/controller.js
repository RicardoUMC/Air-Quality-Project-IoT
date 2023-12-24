const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const moment = require('moment');
const bodyParser = require('body-parser'); // Importar body-parser para analizar los datos POST
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
