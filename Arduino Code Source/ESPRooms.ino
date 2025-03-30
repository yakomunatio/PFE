#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// WiFi & MQTT Settings
const char* ssid = "Hp yassine";
const char* password = "123456789";
const char* mqtt_server = "192.168.137.155";
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

// DHT Sensor
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Sensor Pins
#define LDR_PIN 34
#define PIR_PIN 35
#define MQ7_PIN 25
#define MQ2_PIN 33
#define CO_PIN 36
#define CO2_PIN 26

// Actuator States
bool fanState = false;
bool lightState = false;
bool windowState = false;
bool curtainState = false;

// setup for Serial communication
#define ARDUINO_SERIAL_BAUD 9600

void setup_wifi() {
    Serial.println("Connecting to WiFi...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message received on topic: ");
    Serial.println(topic);
    
    StaticJsonDocument<200> doc;
    deserializeJson(doc, payload, length);
    
    if (doc.containsKey("f")) {
        fanState = doc["f"];
        Serial.print("Fan State: ");
        Serial.println(fanState);
        Serial1.print("F");
        Serial1.print(fanState ? "1" : "0");
    }
    if (doc.containsKey("li")) {
        lightState = doc["li"];
        Serial.print("Light State: ");
        Serial.println(lightState);
        Serial1.print("L");
        Serial1.print(lightState ? "1" : "0");
    }
    if (doc.containsKey("w")) {
        windowState = doc["w"];
        Serial.print("Window State: ");
        Serial.println(windowState);
        Serial1.print("W");
        Serial1.print(windowState ? "1" : "0");
    }
    if (doc.containsKey("c")) {
        curtainState = doc["c"];
        Serial.print("Curtain State: ");
        Serial.println(curtainState);
        Serial1.print("C");
        Serial1.print(curtainState ? "1" : "0");
    }
}

void reconnect() {
    Serial.println("Attempting MQTT connection...");
    while (!client.connected()) {
        if (client.connect("ESP32_Client")) {
            Serial.println("MQTT Connected!");
            client.subscribe("hotel/room/1/control");
        } else {
            Serial.print("Failed, retrying in 5 seconds...");
            delay(5000);
        }
    }
}

void publishData() {
    StaticJsonDocument<200> doc;
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity)) {
        Serial.println("Failed to read from DHT sensor!");
    } else {
        doc["t"] = temperature;
        doc["h"] = humidity;
    }

    doc["rn"] = 1;
    doc["t"] = dht.readTemperature();
    doc["h"] = dht.readHumidity();
    doc["l"] = analogRead(LDR_PIN);
    doc["m"] = digitalRead(PIR_PIN);
    doc["co"] = analogRead(MQ7_PIN)/ 4095.00;
    doc["c2"] = analogRead(CO2_PIN);
    doc["s"] = analogRead(MQ7_PIN)/ 4095.00 ;
    doc["g"] = analogRead(MQ2_PIN)/ 4095.00;
    doc["f"] = fanState;
    doc["li"] = lightState;
    doc["w"] = windowState;
    doc["c"] = curtainState;
    
    char buffer[256];
    serializeJson(doc, buffer);
    Serial.println("Publishing data: ");
    Serial.println(buffer);
    client.publish("hotel/room/sensors", buffer);
}

void setup() {
    Serial.begin(115200);
    Serial1.begin(ARDUINO_SERIAL_BAUD);
    Serial.println("Initializing system...");
    Serial1.println("test");
    
    setup_wifi();
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);
    
    dht.begin();
    pinMode(LDR_PIN, INPUT);
    pinMode(PIR_PIN, INPUT);
    pinMode(MQ7_PIN, INPUT);
    pinMode(MQ2_PIN, INPUT);
    pinMode(CO_PIN, INPUT);
    pinMode(CO2_PIN, INPUT);
    Serial.println("Setup complete!");
}

void loop() {
    if (!client.connected()) {
        reconnect();
    }
    client.loop();
    publishData();
    delay(5000);
}