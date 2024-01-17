#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHTesp.h>
#include <WiFi.h>
#include <HTTPClient.h>

/********************************************************************************/
/* The code below is the definition of constants for colors (BLUE, GREEN, RED)
and a port number (PORT). It also declares and initializes variables for a
connection counter (counterConnection), pins for a moisture sensor (mqPin),
temperature sensor (temPin), and buzzer (buzzerPin). */
#define BLUE 25
#define GREEN 26
#define RED 27
#define PORT 8080

int counterConnection = 0;

const int mqPin = A5;
const int temPin = 15;
const int buzzerPin = 14;

bool lcdBacklight = true;
bool temperatureEnabled = true;
bool humidityEnabled = true;
bool qualityEnabled = true;
bool actuatorsEnabled = true;

unsigned long lastReadTime = 0;
const unsigned long readInterval = 2000;

DHTesp dht;

LiquidCrystal_I2C lcd(0x27, 16, 2);

char *ssid = "--------";
char *password = "--------";

WiFiServer server(PORT);
WiFiClient client;
/********************************************************************************/

/**
 * The setup function initializes various pins, sets up the WiFi connection, and initializes the LCD
 * display and DHT sensor.
 */
void setup() {
  pinMode(mqPin, INPUT);
  pinMode(GREEN, OUTPUT);
  pinMode(BLUE, OUTPUT);
  pinMode(RED, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  Serial.begin(9600);

  lcd.init();
  lcd.backlight();

  /********************* CONEXIÓN A UNA RED WIFI ***********************/
  WiFi.begin(ssid,password);

  while (WiFi.status() != WL_CONNECTED && counterConnection < 10) {
    delay(500);
    Serial.print(".");
    counterConnection++;
  }

  if (counterConnection < 10) {
    // IPAddress ip(192,168,0,7);
    // IPAddress gateway(192,168,0,0);
    // IPAddress subnet(255,255,0,0);

    IPAddress ip(192,168,255,7);
    IPAddress gateway(192,168,255,0);
    IPAddress subnet(255,255,255,0);
    WiFi.config(ip, gateway, subnet);

    Serial.println("");
    Serial.println("Conectado al WiFi");

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Conectado");
    lcd.setCursor(0, 1);
    lcd.print("al WiFi");

    server.begin();
    Serial.print("API ESP32 desplegado en la ip 'http://");
    Serial.print(WiFi.localIP());
    Serial.print(":");
    Serial.print(PORT);
    Serial.println("'");
  } else {
    Serial.println("");
    Serial.println("No conectado al WiFi");

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("No conectado");
    lcd.setCursor(0, 1);
    lcd.print("al WiFi");
  }

  delay(1500);
/**********************************************************************/

  dht.setup(temPin, DHTesp::DHT11);
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Proyecto de IoT");
  lcd.setCursor(0, 1);
  lcd.print("Calidad de aire");

  delay(2500);
}

/**
 * The main function "loop" handles web requests, reads quality and temperature values at specified
 * intervals, and processes commands received from the serial port.
 */
void loop() {
  int result = handleWebRequests();

  unsigned long currentTime = millis();

  if (currentTime - lastReadTime >= readInterval) {
    
    if (qualityEnabled) int qualityValue = readQuality();

    if (temperatureEnabled) float tempValue = readTemperature();

    lastReadTime = currentTime;
  }

  if (Serial.available() > 0) {
    char command = Serial.read();
    processCommand(command);
  }
}

/**
 * The function "readQuality" reads the value from an analog pin, displays it on an LCD screen and
 * controls actuators based on the value.
 * 
 * @return the value of the variable "readedValue", which is the result of the analogRead() function.
 */
int readQuality() {
  int readedValue = analogRead(mqPin);

  Serial.print("Valor obtenido (MQ): ");
  Serial.print(readedValue);
  Serial.println(" PPM");

  lcd.setCursor(0, 0);
  lcd.print("MQ:             ");
  lcd.setCursor(4, 0);
  lcd.print(readedValue);
  lcd.print(" PPM");

  if (actuatorsEnabled) {
    if (readedValue < 135)
    {
      digitalWrite(GREEN, HIGH);
      digitalWrite(BLUE, LOW);
      digitalWrite(RED, LOW);
    }
    else if (readedValue < 155)
    {
      digitalWrite(BLUE, HIGH);
      digitalWrite(GREEN, LOW);
      digitalWrite(RED, LOW);
    }
    else
    {
      digitalWrite(RED, HIGH);
      digitalWrite(GREEN, LOW);
      digitalWrite(BLUE, LOW);
    }

    if (readedValue >= 180) 
      digitalWrite(buzzerPin, HIGH);
    else
      digitalWrite(buzzerPin, LOW);
  }

  return readedValue;
}

/**
 * The function "readTemperature" reads the temperature value from a sensor, displays it on a serial
 * monitor and an LCD screen, and returns the temperature value.
 * 
 * @return the temperature value that was read from the sensor.
 */
float readTemperature()
{
  float readedValue = dht.getTemperature();

  Serial.print("Temperatura: ");
  Serial.print(readedValue);
  Serial.println(" °C");

  lcd.setCursor(0, 1);
  lcd.print("Temp:           ");
  lcd.setCursor(6, 1);
  lcd.print(readedValue);
  lcd.print(" °C");

  return readedValue;
}

/**
 * The function handles web requests by processing different commands and sending appropriate
 * responses.
 * 
 * @return an integer value. If a client is available and a valid request is received, the function
 * returns 1. Otherwise, it returns 0.
 */
int handleWebRequests() {
  client = server.available();

  if (!client) return 0;

  Serial.println("Nuevo cliente");
  String request = "";
  while (client.connected()) {
    if (client.available()) {
      request = client.readStringUntil('\r');

      if (request.indexOf("GET /lcdBacklight") != -1) {
        processCommand('l');
        sendHTTPResponse(String(lcdBacklight));
      }
      
      else if (request.indexOf("GET /getQuality") != -1) {
        if (qualityEnabled) sendHTTPResponse(String(analogRead(mqPin)));
        else sendHTTPResponse(String(qualityEnabled));
      }
      
      else if (request.indexOf("GET /getTemperature") != -1) {
        if (temperatureEnabled) sendHTTPResponse(String(dht.getTemperature()));
        else sendHTTPResponse(String(temperatureEnabled));
      }
      
      else if (request.indexOf("GET /getHumidity") != -1) {
        if (humidityEnabled) sendHTTPResponse(String(dht.getHumidity()));
        else sendHTTPResponse(String(humidityEnabled));
      }
      
      else if (request.indexOf("GET /resetDevice") != -1) {
        processCommand('x');
        sendHTTPResponse("Reiniciando el programa...");
      }
      
      else if (request.indexOf("GET /temperature") != -1) {
        processCommand('t');
        sendHTTPResponse(String(temperatureEnabled));
      }
      
      else if (request.indexOf("GET /humidity") != -1) {
        processCommand('h');
        sendHTTPResponse(String(humidityEnabled));
      }
      
      else if (request.indexOf("GET /quality") != -1) {
        processCommand('q');
        sendHTTPResponse(String(qualityEnabled));
      }
      
      else if (request.indexOf("GET /actuators") != -1) {
        processCommand('a');
        sendHTTPResponse(String(actuatorsEnabled));
      }

      else {
        client.println("HTTP/1.1 404");
        client.println("Content-Type: text/plain");
        client.println("Connection: close");
        client.println();
        client.println("Not Found");
        client.println();
        return 0;
      }
      
      client.flush();
      delay(100);
      break;
    }
  }

  client.stop();

  return 1;
}

/**
 * The function sends an HTTP response with the provided content.
 * 
 * @param content The "content" parameter is a string that represents the response content that will be
 * sent back to the client. It can be any text or data that you want to include in the response.
 */
void sendHTTPResponse(String content) {
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/plain");
  client.println("Connection: close");
  client.println();
  client.println(content);
  client.println();
}

/**
 * The function "processCommand" takes a character command as input and performs different actions
 * based on the command received.
 * 
 * @param command The parameter "command" is of type char and represents the command received from an
 * external source. It is used in a switch statement to determine the action to be taken based on the
 * command.
 */
void processCommand(char command) {
  switch (command) {
    case 'L':
    case 'l':
      toggleLCD();
      delay(1000);
      lcd.clear();
      break;
    case 'X':
    case 'x':
      resetESP();
      break;
    case 'T':
    case 't':
      toggleTempDataSending();
      delay(1000);
      lcd.clear();
      break;
    case 'H':
    case 'h':
      toggleHumidityDataSending();
      delay(1000);
      lcd.clear();
      break;
    case 'Q':
    case 'q':
      toggleQualityDataSending();
      delay(1000);
      lcd.clear();
      break;
    case 'A':
    case 'a':
      toggleActuator();
      delay(1000);
      lcd.clear();
      break;
    case '\n':
    case '\r':
      break;
    default:
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Comando inválido");
      Serial.println("Comando no reconocido.");
      delay(1000);
      lcd.clear();
      break;
  }
}

/**
 * The function toggleLCD toggles the backlight of an LCD display and prints a message to the serial
 * monitor.
 */
void toggleLCD() {
  lcdBacklight = !lcdBacklight;
  if (lcdBacklight) {
    lcd.backlight();
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("BACKLIGHT ON");
    Serial.println("Comando ejecutado: Encender LCD.");
  } else {
    lcd.noBacklight();
    lcd.clear();
    Serial.println("Comando ejecutado: Apagar LCD.");
  }
}

/* The `resetESP()` function is responsible for restarting the ESP32 microcontroller. */
void resetESP() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Reinicio del programa");
  Serial.println("Reiniciando el programa...");
  delay(1000);
  ESP.restart();
}

/**
 * The function toggleTempDataSending toggles the state of temperatureEnabled and prints a message
 * indicating whether temperature data sending is enabled or stopped.
 */
void toggleTempDataSending() {
  temperatureEnabled = !temperatureEnabled;
  if (temperatureEnabled) {
    Serial.println("Comando ejecutado: Enviar datos del sensor de temperatura.");
  } else {
    Serial.println("Comando ejecutado: Detener datos del sensor de temperatura.");
  }
}

/**
 * The function toggleHumidityDataSending toggles the state of the humidityEnabled variable and prints
 * a message indicating whether the data sending is enabled or stopped.
 */
void toggleHumidityDataSending() {
  humidityEnabled = !humidityEnabled;
  if (humidityEnabled) {
    Serial.println("Comando ejecutado: Enviar datos del sensor de humedad.");
  } else {
    Serial.println("Comando ejecutado: Detener datos del sensor de humedad.");
  }
}

/**
 * The function toggleQualityDataSending toggles the state of qualityEnabled and prints a message
 * indicating whether data from the air particle sensor is being sent or stopped.
 */
void toggleQualityDataSending() {
  qualityEnabled = !qualityEnabled;
  if (qualityEnabled) {
    Serial.println("Comando ejecutado: Enviar datos del sensor de particulas en el aire.");
  } else {
    Serial.println("Comando ejecutado: Detener datos del sensor de particulas en el aire.");
  }
}

/**
 * The function toggleActuator toggles the state of the actuators (LED and Buzzer) and prints a
 * corresponding message.
 */
void toggleActuator() {
  actuatorsEnabled = !actuatorsEnabled;
  if (actuatorsEnabled) {
    Serial.println("Comando ejecutado: Activar el actuador (LED y Buzzer).");
  } else {
    digitalWrite(RED, LOW);
    digitalWrite(GREEN, LOW);
    digitalWrite(BLUE, LOW);
    digitalWrite(buzzerPin, LOW);
    Serial.println("Comando ejecutado: Desactivar el actuador (LED y Buzzer).");
  }
}
