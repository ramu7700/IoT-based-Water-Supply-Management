#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>

// Wi-Fi credentials
const char* ssid = "your_SSID"; // Replace with your Wi-Fi SSID
const char* password = "your_PASSWORD"; // Replace with your Wi-Fi password

// Define the HTTP endpoint for your PHP script
const char* serverUrl = "http://localhost/insert_data.php"; // Update with your XAMPP URL if needed

// Initialize Wi-Fi and MQTT client
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

// Define pins for sensors
#define FLOW_SENSOR_PIN 2
#define PRESSURE_SENSOR_PIN 34 // Example GPIO pin for pressure sensor
#define PH_SENSOR_PIN 35      // Example GPIO pin for pH sensor

// Define a struct to hold all sensor readings
struct SensorData {
    float flowRate;   // Flow rate in L/min
    float pressure;   // Pressure in kPa
    float pH;        // pH level
};

// Create an instance of the struct
SensorData sensorData;

// Variables for flow sensor
volatile int flowFrequency = 0;

// Timing variables
unsigned long currentTime;
unsigned long previousTime;

void flow() {
    flowFrequency++;
}

void setup() {
    pinMode(FLOW_SENSOR_PIN, INPUT);
    digitalWrite(FLOW_SENSOR_PIN, HIGH); // Optional internal pull-up
    
    Serial.begin(115200);

    // Connect to Wi-Fi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");

    attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flow, RISING);
    
    currentTime = millis();
    previousTime = currentTime;
}

void loop() {
    currentTime = millis();

    if (currentTime - previousTime >= 600000) { // Update every 10 minutes (600000 ms)
        previousTime = currentTime;

        // Calculate flow rate (L/min)
        sensorData.flowRate = (flowFrequency / 7.5);
        
        // Read pressure from the pressure sensor
        int pressureValue = analogRead(PRESSURE_SENSOR_PIN);
        float voltage = pressureValue * (5.0 / 1023.0);
        sensorData.pressure = (voltage - 0.2) * (700 / (4.7 - 0.2)); // Adjust based on calibration

        // Read pH value from the pH sensor
        int pHValue = analogRead(PH_SENSOR_PIN);
        float voltagePH = pHValue * (5.0 / 1023.0);
        sensorData.pH = voltagePH * 3.5; // Adjust based on calibration

        // Prepare JSON payload
        String payload = "{\"flowRate\":" + String(sensorData.flowRate) +
                         ",\"pressure\":" + String(sensorData.pressure) +
                         ",\"pH\":" + String(sensorData.pH) + "}";

        // Send data to PHP script
        if (WiFi.status() == WL_CONNECTED) {
            HTTPClient http;
            http.begin(serverUrl); // Use the server URL for your PHP script
            http.addHeader("Content-Type", "application/json");

            int httpResponseCode = http.POST(payload);

            if (httpResponseCode > 0) {
                Serial.printf("HTTP Response code: %d\n", httpResponseCode);
            } else {
                Serial.printf("Error sending POST: %s\n", http.errorToString(httpResponseCode).c_str());
            }

            http.end();
        }

        // Reset pulse counter for next calculation
        flowFrequency = 0;

        // Print results to Serial Monitor
        Serial.println(payload);
    }

    mqttClient.loop(); // Keep MQTT connection alive if you're using MQTT as well
}
