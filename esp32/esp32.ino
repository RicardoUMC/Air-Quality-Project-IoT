#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHTesp.h>
#include <WiFi.h>
#include <HTTPClient.h>

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
const unsigned long readInterval = 2000; // Lectura de sensores cada 2000 milisegundos (2 segundos)

DHTesp dht;

LiquidCrystal_I2C lcd(0x27, 16, 2); // Dirección I2C, número de columnas y filas
char *ssid = "--------";
char *password = "--------";

WiFiServer server(PORT);
WiFiClient client;
String serverAddress = "http://192.168.0.6:8080/";

String request;

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
    IPAddress ip(192,168,0,7);
    IPAddress gateway(192,168,0,0);
    IPAddress subnet(255,255,0,0);
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

  if (readedValue >= 180 && actuatorsEnabled) 
    digitalWrite(buzzerPin, HIGH);
  else
    digitalWrite(buzzerPin, LOW);

  return readedValue;
}

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

int handleWebRequests() {
  client = server.available();

  if (!client) return 0;

  Serial.println("Nuevo cliente");
  String buffer = "";
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
        else sendHTTPResponse(String(temperatureEnable));
      }
      
      else if (request.indexOf("GET /getHumidity") != -1) {
        if (humidityEnabled) sendHTTPResponse(String(dht.getHumidity()));
        else sendHTTPResponse(String(humidityEnable));
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

// UNUSED
String formatQualityData(int value) {
  return "airQuality=" + String(value);
}

// UNUSED
String formatTemperatureData(float value) {
  return "temperature=" + String(value);
}

// UNUSED
int sendSensorsData(String &data) {
  if (WiFi.status() != WL_CONNECTED)
    WiFi.begin(ssid, password);

  HTTPClient http;

  http.begin(serverAddress);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  int httpResponseCode = http.POST(data);
  http.end();

  return httpResponseCode > 0;
}

void sendHTTPResponse(String content) {
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/plain");
  client.println("Connection: close");
  client.println();
  client.println(content);
  client.println();
}

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

void resetESP() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Reinicio del programa");
  Serial.println("Reiniciando el programa...");
  delay(1000); // Espera 1 segundo
  ESP.restart(); // Reinicia el ESP32
}

void toggleTempDataSending() {
  temperatureEnable = !temperatureEnable;
  if (temperatureEnable) {
    Serial.println("Comando ejecutado: Enviar datos del sensor de temperatura.");
  } else {
    Serial.println("Comando ejecutado: Detener datos del sensor de temperatura.");
  }
}

void toggleHumidityDataSending() {
  humidityEnable = !humidityEnable;
  if (humidityEnable) {
    Serial.println("Comando ejecutado: Enviar datos del sensor de humedad.");
  } else {
    Serial.println("Comando ejecutado: Detener datos del sensor de humedad.");
  }
}

void toggleQualityDataSending() {
  qualityEnabled = !qualityEnabled;
  if (qualityEnabled) {
    Serial.println("Comando ejecutado: Enviar datos del sensor de particulas en el aire.");
  } else {
    Serial.println("Comando ejecutado: Detener datos del sensor de particulas en el aire.");
  }
}

void toggleActuator() {
  actuatorsEnabled = !actuatorsEnabled;
  if (actuatorsEnabled) {
    Serial.println("Comando ejecutado: Activar el actuador (LED y Buzzer).");
  } else {
    Serial.println("Comando ejecutado: Desactivar el actuador (LED y Buzzer).");
  }
}
