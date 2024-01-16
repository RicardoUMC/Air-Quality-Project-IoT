/* The lines `const moment = require('moment');` and `const axios = require('axios');` are importing
the `moment` and `axios` libraries in JavaScript. */
const moment = require('moment');
const axios = require('axios');

/* The line `const SERVER_PORT = 'http://192.168.255.7:8080';` is assigning the URL of the server to
the constant variable `SERVER_PORT`. The server is running on the IP address `192.168.255.7` and the
port `8080`. This URL is used in the various functions to construct the complete URL for making HTTP
requests to the server. */
const SERVER_PORT = 'http://192.168.255.7:8080';

/**
 * The function "processSensorData" takes in three sensor responses (air quality, temperature, and
 * humidity) and returns an array with formatted responses.
 * @param airQualityResponse - The airQualityResponse parameter is the response received from the air
 * quality sensor. It can be either a numeric value representing the air quality in parts per million
 * (PPM), or false if the sensor is disabled.
 * @param temperatureResponse - The temperature response is the value obtained from a temperature
 * sensor. It represents the current temperature in degrees Celsius.
 * @param humidityResponse - The humidityResponse parameter is the response received from the humidity
 * sensor. It could be a numerical value representing the humidity level in percentage, or it could be
 * false if the humidity sensor is disabled.
 * @returns an array containing the processed air quality response, temperature response, and humidity
 * response.
 */
function processSensorData(airQualityResponse, temperatureResponse, humidityResponse) {
    if (airQualityResponse == false) {
        airQualityResponse = "Sensor deshabilitado";
    } else {
        airQualityResponse = airQualityResponse + " PPM";
    }

    if (temperatureResponse == false) {
        temperatureResponse = "Sensor deshabilitado";
    } else {
        temperatureResponse = temperatureResponse + "°C";
    }

    if (humidityResponse == false) {
        humidityResponse = "Sensor deshabilitado";
    } else {
        humidityResponse = humidityResponse + "%";
    }

    return [airQualityResponse,temperatureResponse,humidityResponse]
}

/**
 * The function `formatDataToJSON` takes in three sensor data responses (air quality, temperature, and
 * humidity), processes the data, and returns a JSON object containing the processed data.
 * @param airQualityResponse - The `airQualityResponse` parameter is the response data from the air
 * quality sensor. It could be an object or an array containing the air quality data.
 * @param temperatureResponse - The `temperatureResponse` parameter is the response received from a
 * sensor that measures temperature. It could be in any format, such as a number representing the
 * temperature in degrees Celsius or Fahrenheit.
 * @param humidityResponse - The `humidityResponse` parameter is the response received from a humidity
 * sensor. It contains the data related to humidity levels.
 * @returns a promise that resolves to an object containing the processed air quality, temperature, and
 * humidity data.
 */
async function formatDataToJSON(airQualityResponse, temperatureResponse, humidityResponse) {
    try {
        let processData = processSensorData(airQualityResponse, temperatureResponse, humidityResponse);

        const [airQuality, temperature, humidity] = await Promise.all([
            processData[0],
            processData[1],
            processData[2]
        ]);

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

/**
 * The function `getQualityData` is an asynchronous function that makes a GET request to a specified
 * path and returns the response data, or throws an error if the request fails.
 * @param path - The `path` parameter is a string that represents the endpoint or route of the server
 * where the quality data is being requested from. It is used to construct the URL for the HTTP GET
 * request.
 * @returns the data obtained from the API call.
 */
async function getQualityData(path) {
    try {
        const response = await axios.get(SERVER_PORT + path);

        return response.data;
    } catch (error) {
        throw `No se pudo conseguir el valor de calidad de aire. ${error}`;
    }
}

/**
 * The function `getTemperatureData` is an asynchronous function that makes a GET request to a
 * specified path and returns the response data.
 * @param path - The `path` parameter is a string that represents the endpoint or route of the server
 * where the temperature data is being fetched from. It is used to construct the URL for the GET
 * request made using the axios library.
 * @returns the data from the response of the axios GET request.
 */
async function getTemperatureData(path) {
    try {
        const response = await axios.get(SERVER_PORT + path);

        return response.data;
    } catch (error) {
        throw `No se pudo conseguir el valor de temperatura. ${error}`;
    }
}

/**
 * The function `getHumidityData` is an asynchronous function that makes a GET request to a specified
 * path and returns the response data, or throws an error if the request fails.
 * @param path - The `path` parameter is a string that represents the endpoint or route on the server
 * where the humidity data is located. It is used to construct the URL for the HTTP GET request to
 * retrieve the humidity data.
 * @returns the data obtained from the API call.
 */
async function getHumidityData(path) {
    try {
        const response = await axios.get(SERVER_PORT + path);
        
        return response.data;
    } catch (error) {
        throw `No se pudo conseguir el valor de humedad. ${error}`;
    }
}

/**
 * The function `toggleLCD` is an asynchronous function that sends a GET request to a specified path
 * and returns the response data, or throws an error if the request fails.
 * @param path - The `path` parameter is a string that represents the endpoint or route on the server
 * that needs to be accessed in order to toggle the LCD backlight. It is used in the `axios.get()`
 * method to make a GET request to the specified path.
 * @returns the data from the response of the axios GET request.
 */
async function toggleLCD(path) {
    try {
        const response = await axios.get(SERVER_PORT + path);

        return response.data;
    } catch (error) {
        throw `No se pudo modificar la retroiluminación de la LCD. ${error}`;
    }
}

/**
 * The function `toggleQuality` is an asynchronous function that makes a GET request to a server and
 * returns the response data, or throws an error if the request fails.
 * @param path - The `path` parameter is a string that represents the endpoint or route on the server
 * that needs to be accessed in order to toggle the quality of the LCD backlight.
 * @returns the data from the response of the axios GET request.
 */
async function toggleQuality(path) {
    try {
        const response = await axios.get(SERVER_PORT + path);

        return response.data;
    } catch (error) {
        throw `No se pudo modificar la retroiluminación de la LCD. ${error}`;
    }
}

/**
 * The function `toggleTemperature` is an asynchronous function that makes a GET request to a specified
 * path and returns the response data, or throws an error if the request fails.
 * @param path - The `path` parameter is a string that represents the endpoint or route of the server
 * that you want to send a GET request to. It is used to specify the location of the resource you want
 * to retrieve or interact with.
 * @returns the data from the response of the axios GET request.
 */
async function toggleTemperature(path) {
    try {
        const response = await axios.get(SERVER_PORT + path);

        return response.data;
    } catch (error) {
        throw `No se pudo modificar la retroiluminación de la LCD. ${error}`;
    }
}

/**
 * The function `toggleHumidity` is an asynchronous function that makes a GET request to a specified
 * path and returns the response data.
 * @param path - The `path` parameter is a string that represents the endpoint or route on the server
 * that needs to be accessed in order to toggle the humidity. It is used in the `axios.get()` method to
 * make a GET request to the specified path.
 * @returns the data from the response of the axios GET request.
 */
async function toggleHumidity(path) {
    try {
        const response = await axios.get(SERVER_PORT + path);

        return response.data;
    } catch (error) {
        throw `No se pudo modificar la retroiluminación de la LCD. ${error}`;
    }
}

/**
 * The function `toggleActuators` is an asynchronous function that sends a GET request to a specified
 * path and returns the response data.
 * @param path - The `path` parameter is a string that represents the endpoint or route on the server
 * where the actuator should be toggled. It is used to construct the URL for the GET request made using
 * the axios library.
 * @returns the data from the response of the axios GET request.
 */
async function toggleActuators(path) {
    try {
        const response = await axios.get(SERVER_PORT + path);

        return response.data;
    } catch (error) {
        throw `No se pudo modificar la retroiluminación de la LCD. ${error}`;
    }
}

/**
 * The function `resetDevice` is an asynchronous function that makes a GET request to a server and
 * returns the response data, or throws an error if the request fails.
 * @param path - The `path` parameter is a string that represents the endpoint or route on the server
 * that needs to be accessed in order to reset the device.
 * @returns the data from the response of the axios GET request.
 */
async function resetDevice(path) {
    try {
        const response = await axios.get(SERVER_PORT + path);

        return response.data;
    } catch (error) {
        throw `No se pudo modificar la retroiluminación de la LCD. ${error}`;
    }
}

/**
 * The function consoleTime logs a message to the console along with the current date and time.
 * @param message - The `message` parameter is a string that represents the message you want to log to
 * the console.
 */
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
    toggleLCD,
    toggleQuality,
    toggleTemperature,
    toggleHumidity,
    toggleActuators,
    resetDevice,
    consoleTime
};