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

bool temperatureEnable = true;
bool qualityEnabled = true;
bool activateActuator = true;

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
    IPAddress ip(192,168,1,147);
    IPAddress gateway(192,168,1,254);
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

    if (temperatureEnable) float tempValue = readTemperature();

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

  if (readedValue >= 180 && activateActuator) 
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

      if (request.indexOf("GET /LCD/On") != -1) {
        processCommand('l');
        sendHTTPResponse("Encender retroiluminación.");
      }
      
      else if (request.indexOf("GET /LCD/Off") != -1) {
        processCommand('d');
        sendHTTPResponse("Apagar retroiluminación.");
      }
      
      else if (request.indexOf("GET /getQuality") != -1) {
        if (qualityEnabled) sendHTTPResponse(String(analogRead(mqPin)));
        else sendHTTPResponse("Not Enable");
      }
      
      else if (request.indexOf("GET /getTemperature") != -1) {
        if (temperatureEnable) sendHTTPResponse(String(dht.getTemperature()));
        else sendHTTPResponse("Not Enable");
      }
      
      else if (request.indexOf("GET /getHumidity") != -1) {
        sendHTTPResponse(String(dht.getHumidity()));
      }
      
      else if (request.indexOf("GET /changeName") != -1) {
        processCommand('n');
        sendHTTPResponse("Ingrese el nombre nuevo para el dispositivo:");
      }
      
      else if (request.indexOf("GET /resetDevice") != -1) {
        processCommand('x');
        sendHTTPResponse("Reiniciando el programa...");
      }
      
      else if (request.indexOf("GET /temperature") != -1) {
        processCommand('t');
        buffer = (temperatureEnable) ? "habilitada." : "deshabilitada.";
        sendHTTPResponse("Senseo de temperatura " + buffer);
      }
      
      else if (request.indexOf("GET /quality") != -1) {
        processCommand('q');
        buffer = (qualityEnabled) ? "habilitado." : "deshabilitado.";
        sendHTTPResponse("Senseo de particulas por millón " + buffer);
      }
      
      else if (request.indexOf("GET /actuator") != -1) {
        processCommand('a');
        buffer = (activateActuator) ? "habilitados" : "deshabilitados";
        sendHTTPResponse("Actuadores " + buffer);
      }
      
      else if (request.indexOf("GET /nombre") != -1) {
        processCommand('g');
        sendHTTPResponse("Nombre: " + (String) ssid);
      }

      else {
        sendHTTPResponse("Comando GET no reconocido");
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
      lcd.backlight();
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Retroiluminacion ON");
      Serial.println("Comando ejecutado: Encender retroiluminación.");
      delay(1000);
      lcd.clear();
      break;
    case 'D':
    case 'd':
      lcd.noBacklight();
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Retroiluminacion OFF");
      Serial.println("Comando ejecutado: Apagar retroiluminación.");
      break;
    case 'S':
    case 's':
      lcd.scrollDisplayRight();
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Desplazamiento der.");
      Serial.println("Comando ejecutado: Desplazar hacia la derecha.");
      break;
    case 'R':
    case 'r':
      lcd.home();
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Posicion original");
      Serial.println("Comando ejecutado: Volver a la posición original.");
      break;
    case 'N':
    case 'n':
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Ingrese un");
      lcd.setCursor(0, 1);
      lcd.print("nombre nuevo:");
      Serial.println("Ingrese el nombre nuevo para el dispositivo:");
      changessid();
      delay(3000);
      lcd.clear();
      break;
    case 'X':
    case 'x':
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Reinicio del programa");
      Serial.println("Reiniciando el programa...");
      delay(1000); // Espera 1 segundo
      ESP.restart(); // Reinicia el ESP32
      break;
    case 'T':
    case 't':
      toggleTempDataSending();
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
    case 'G':
    case 'g':
      // Muestra el nombre actual del dispositivo Bluetooth
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Nombre BT Actual:");
      lcd.setCursor(0, 1);
      lcd.print(ssid);
      Serial.println("Comando ejecutado: Mostrar nombre del dispositivo Bluetooth.");
      delay(3000);
      lcd.clear();
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

// TODO
void changessid() {}

void toggleTempDataSending() {
  temperatureEnable = !temperatureEnable;
  if (temperatureEnable) {
    Serial.println("Comando ejecutado: Enviar datos del sensor de temperatura.");
  } else {
    Serial.println("Comando ejecutado: Detener datos del sensor de temperatura.");
  }
}

void toggleQualityDataSending() {
  qualityEnabled = !qualityEnabled;
  if (qualityEnabled) {
    Serial.println("Comando ejecutado: Enviar datos del sensor de calidad del aire.");
  } else {
    Serial.println("Comando ejecutado: Detener datos del sensor de calidad del aire.");
  }
}

void toggleActuator() {
  activateActuator = !activateActuator;
  if (activateActuator) {
    Serial.println("Comando ejecutado: Activar el actuador (LED y Buzzer).");
  } else {
    Serial.println("Comando ejecutado: Desactivar el actuador (LED y Buzzer).");
  }
}
