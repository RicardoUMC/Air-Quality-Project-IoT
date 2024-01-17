**IoT Environmental Monitoring System**

## Overview

This Internet of Things (IoT) project involves building an environmental monitoring system using an ESP32 microcontroller. The system integrates sensors for air quality and temperature, with real-time data visualization through a web application.

## Features

- **Sensor Integration:** Utilizes MQ gas and DHT temperature sensors to measure air quality and temperature.
  
- **Actuators:** Implements LEDs and a buzzer as actuators to provide visual and audible feedback based on environmental conditions.

- **Wireless Communication:** The ESP32 connects to a Wi-Fi network and communicates with a Node.js server over HTTP for real-time data transmission.

- **Web Application:** Employs a basic web application built with Node.js, Express, and Socket.IO for dynamic data visualization.

## Project Structure

- **controller:** Contains the Node.js server code responsible for handling HTTP requests and managing WebSocket connections.

- **model:** Represents the model layer responsible for communicating with the ESP32, processing sensor data, and responding to controller requests.

- **view:** Holds the static HTML file for the web application, including JavaScript to establish a WebSocket connection for real-time updates.

## Setup Instructions

1. **Hardware Configuration:**
   - Connect the MQ gas sensor, DHT temperature sensor, LEDs, and buzzer to the ESP32 on a breadboard.

2. **Software Configuration:**
   - Modify your router **ssid** and **password** in the `esp32/esp32.ino` file.
   - Upload the provided ESP32 firmware code to read sensor data and establish Wi-Fi communication.

3. **Node.js Server:**
   - Install Node.js and run `npm install` in the `root` directory to install dependencies.
   - Start the server using `npm start`.

4. **Web Application:**
   - Open the `view/public/index.html` file in a web browser to view real-time sensor data.
   - **(Alternative)** Check for your IPv4 address and open `http://ip_address:8080` in a web browser.

## Usage

Access the web application to monitor environmental data in real time. LEDs and the buzzer will indicate air quality, while temperature readings are displayed on the web page.

## Contributing

Contributions are welcome! Feel free to open issues or pull requests.