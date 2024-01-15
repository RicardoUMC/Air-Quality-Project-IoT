const moment = require('moment');
const axios = require('axios');

function processSensorData(airQualityResponse, temperatureResponse, humidityResponse) {
    if (airQualityResponse === "Not Enabled") {
        airQualityResponse = "Sensor deshabilitado";
    } else {
        airQualityResponse = airQualityResponse + " PPM";
    }

    if (temperatureResponse === "Not Enabled") {
        temperatureResponse = "Sensor deshabilitado";
    } else {
        temperatureResponse = temperatureResponse + "°C";
    }

    if (humidityResponse === "Not Enabled") {
        humidityResponse = "Sensor deshabilitado";
    } else {
        humidityResponse = humidityResponse + "%";
    }

    return [airQualityResponse,temperatureResponse,humidityResponse]
}

async function formatDataToJSON(airQualityResponse, temperatureResponse, humidityResponse) {
    try {
        let processData = processSensorData(airQualityResponse, temperatureResponse, humidityResponse);
        
        const [airQuality, temperature, humidity] = await Promise.all([
            processData[0],
            processData[1],
            processData[2]
        ]);

        // Procesar los datos recibidos y devolver un objeto JSON
        const processedData = {
            airQuality,
            temperature,
            humidity
        };

        return processedData;
    } catch (error) {
        // Manejar errores si alguna de las promesas falla
        throw error;
    }
}

async function getQualityData() {
    try {
        const response = await axios.get('http://192.168.0.7:8080/getQuality');
        // Procesar la respuesta y devolver los datos de calidad
        return response.data;
    } catch (error) {
        throw `No se pudo conseguir el valor de calidad de air. ${error}`;
    }
}

async function getTemperatureData() {
    try {
        const response = await axios.get('http://192.168.0.7:8080/getTemperature');
        // Procesar la respuesta y devolver los datos de temperatura
        return response.data;
    } catch (error) {
        throw `No se pudo conseguir el valor de temperatura. ${error}`;
    }
}

async function getHumidityData() {
    try {
        const response = await axios.get('http://192.168.0.7:8080/getHumidity');
        // Procesar la respuesta y devolver los datos de humedad
        return response.data;
    } catch (error) {
        throw `No se pudo conseguir el valor de humedad. ${error}`;
    }
}

function consoleTime(message) {
    const time = moment().format('DD-MM-YYYY HH:mm:ss');
    console.log(`[${time}] ${message}`);
}

module.exports = {
    processSensorData,
    formatDataToJSON,
    getQualityData,
    getTemperatureData,
    getHumidityData,
    consoleTime
};