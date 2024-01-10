const moment = require('moment');
const axios = require('axios');

async function processSensorData(airQualityResponse, temperatureResponse, humidityResponse) {
    try {
        const [airQuality, temperature, humidity] = await Promise.all([
            airQualityResponse,
            temperatureResponse,
            humidityResponse
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
        throw `Error al tratar de conseguir el valor de calidad de aire:${error}`;
    }
}

async function getTemperatureData() {
    try {
        const response = await axios.get('http://192.168.0.7:8080/getTemperature');
        // Procesar la respuesta y devolver los datos de temperatura
        return response.data;
    } catch (error) {
        throw `Error al tratar de conseguir el valor de temperatura:${error}`;
    }
}

async function getHumidityData() {
    try {
        const response = await axios.get('http://192.168.0.7:8080/getHumidity');
        // Procesar la respuesta y devolver los datos de humedad
        return response.data;
    } catch (error) {
        throw `Error al tratar de conseguir el valor de humedad:${error}`;
    }
}

function consoleTime(message) {
    const time = moment().format('DD-MM-YYYY HH:mm:ss');
    console.log(`[${time}] ${message}`);
}

module.exports = {
    processSensorData,
    getSensorsData,
    getQualityData,
    getTemperatureData,
    getHumidityData,
    consoleTime
};