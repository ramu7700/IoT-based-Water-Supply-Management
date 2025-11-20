#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server endpoint
const char* serverUrl = "http://YOUR_SERVER_IP/insert_data.php";

// Pin definitions
const int FLOW_SENSOR_PIN = 4;
const int PRESSURE_SENSOR_PIN = 34;
const int PH_SENSOR_PIN = 35;

// Flow sensor variables
volatile int pulseCount = 0;
float calibrationFactor = 7.5; // 7.5 pulses per L/min
unsigned long oldTime = 0;
unsigned long totalVolume = 0;

// Data structure
struct SensorData {
  float flowRate;
  float pressure;
  float pH;
  float consumption;
  unsigned long timestamp;
};

SensorData currentData;

// Interrupt service routine for flow sensor
void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== Water Supply Management System ===");
  Serial.println("Initializing...");
  
  // Initialize pins
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  pinMode(PRESSURE_SENSOR_PIN, INPUT);
  pinMode(PH_SENSOR_PIN, INPUT);
  
  // Attach interrupt for flow sensor
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, FALLING);
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("System Ready!");
  Serial.println("Reading sensors every 10 minutes...\n");
}

void loop() {
  // Read sensors every 10 minutes (600000 ms)
  static unsigned long lastReadTime = 0;
  unsigned long currentTime = millis();
  
  if (currentTime - lastReadTime >= 600000 || lastReadTime == 0) {
    lastReadTime = currentTime;
    
    // Read all sensors
    readSensors();
    
    // Display readings
    displayReadings();
    
    // Send data to server
    sendDataToServer();
  }
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectWiFi();
  }
  
  delay(1000);
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi Connection Failed!");
  }
}

void readSensors() {
  Serial.println("\n--- Reading Sensors ---");
  
  // Read flow rate
  currentData.flowRate = readFlowRate();
  
  // Read pressure
  currentData.pressure = readPressure();
  
  // Read pH
  currentData.pH = readPH();
  
  // Calculate consumption (flow rate × 10 minutes)
  currentData.consumption = currentData.flowRate * 10.0;
  
  // Update total volume
  totalVolume += (unsigned long)currentData.consumption;
  
  // Store timestamp
  currentData.timestamp = millis();
}

float readFlowRate() {
  // Calculate flow rate based on pulse count
  // Flow rate (L/min) = pulse frequency / calibration factor
  
  unsigned long currentTime = millis();
  unsigned long elapsedTime = currentTime - oldTime;
  
  if (elapsedTime >= 1000) { // Calculate every second
    float frequency = (float)pulseCount / (elapsedTime / 1000.0);
    float flowRate = frequency / calibrationFactor;
    
    oldTime = currentTime;
    pulseCount = 0;
    
    return flowRate;
  }
  
  return 0.0;
}

float readPressure() {
  // Read analog value from pressure sensor
  int analogValue = analogRead(PRESSURE_SENSOR_PIN);
  
  // Convert to voltage (ESP32 ADC: 0-4095 = 0-3.3V)
  float voltage = (analogValue / 4095.0) * 3.3;
  
  // Convert voltage to pressure (0.2-4.7V = 0-700 kPa)
  // Linear interpolation
  float pressure = 0.0;
  
  if (voltage >= 0.2 && voltage <= 4.7) {
    pressure = ((voltage - 0.2) / (4.7 - 0.2)) * 700.0;
  }
  
  return pressure;
}

float readPH() {
  // Read analog value from pH sensor
  int analogValue = analogRead(PH_SENSOR_PIN);
  
  // Convert to voltage
  float voltage = (analogValue / 4095.0) * 3.3;
  
  // Convert voltage to pH (assuming linear: 0V=0pH, 3.3V=14pH)
  // Adjust calibration based on your specific pH sensor
  float pH = (voltage / 3.3) * 14.0;
  
  // Constrain to valid pH range
  pH = constrain(pH, 0.0, 14.0);
  
  return pH;
}

void displayReadings() {
  Serial.println("\n=== Sensor Readings ===");
  Serial.print("Flow Rate: ");
  Serial.print(currentData.flowRate, 2);
  Serial.println(" L/min");
  
  Serial.print("Pressure: ");
  Serial.print(currentData.pressure, 2);
  Serial.println(" kPa");
  
  Serial.print("pH Level: ");
  Serial.println(currentData.pH, 2);
  
  Serial.print("Consumption (10 min): ");
  Serial.print(currentData.consumption, 2);
  Serial.println(" L");
  
  Serial.print("Total Volume: ");
  Serial.print(totalVolume);
  Serial.println(" L");
  
  Serial.println("=======================\n");
}

void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot send data: WiFi not connected");
    return;
  }
  
  Serial.println("Sending data to server...");
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["flowRate"] = currentData.flowRate;
  doc["pressure"] = currentData.pressure;
  doc["pH"] = currentData.pH;
  doc["consumption"] = currentData.consumption;
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  Serial.print("JSON Payload: ");
  Serial.println(jsonPayload);
  
  // Send POST request with retry logic
  int attempts = 0;
  int httpResponseCode = -1;
  
  while (attempts < 3 && httpResponseCode <= 0) {
    httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response Code: ");
      Serial.println(httpResponseCode);
      
      String response = http.getString();
      Serial.print("Server Response: ");
      Serial.println(response);
      
      if (httpResponseCode == 200) {
        Serial.println("✓ Data sent successfully!");
      } else {
        Serial.println("✗ Server returned error");
      }
    } else {
      attempts++;
      Serial.print("✗ HTTP Error: ");
      Serial.println(http.errorToString(httpResponseCode));
      
      if (attempts < 3) {
        Serial.println("Retrying in 5 seconds...");
        delay(5000);
      }
    }
  }
  
  http.end();
  
  if (httpResponseCode <= 0) {
    Serial.println("Failed to send data after 3 attempts");
  }
}
