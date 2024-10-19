// Define pins for sensors
#define FLOW_SENSOR_PIN 2   // Digital pin for flow sensor
#define PRESSURE_SENSOR_PIN A0 // Analog pin for pressure sensor
#define PH_SENSOR_PIN A1      // Analog pin for pH sensor

// Define a struct to hold all sensor readings
struct SensorData {
    float flowRate;   // Flow rate in L/min
    float totalVolume; // Total volume in liters
    float pressure;   // Pressure in kPa
    float pH;        // pH level
};

// Create an instance of the struct
SensorData sensorData;

// Variables for flow sensor
volatile int flowFrequency = 0; // Measures flow sensor pulses

// Timing variables
unsigned long currentTime;
unsigned long previousTime;

// Function to handle flow sensor interrupts
void flow() {
    flowFrequency++;
}

void setup() {
    // Set up the flow sensor pin as input
    pinMode(FLOW_SENSOR_PIN, INPUT);
    digitalWrite(FLOW_SENSOR_PIN, HIGH); // Optional internal pull-up

    // Start serial communication for output
    Serial.begin(9600);

    // Attach interrupt to the flow sensor pin
    attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flow, RISING);
    
    // Initialize timing variables
    currentTime = millis();
    previousTime = currentTime;

    // Initialize total volume to zero in struct instance
    sensorData.totalVolume = 0;
}

void loop() {
    currentTime = millis();

    // Calculate and print every second (1000 ms)
    if (currentTime - previousTime >= 1000) {
        previousTime = currentTime;

        // Calculate flow rate (L/min)
        sensorData.flowRate = (flowFrequency / 7.5); // Convert pulse frequency to L/min

        // Calculate total volume (liters)
        sensorData.totalVolume += (flowFrequency / 7.5) / 60; // Convert to liters

        // Read pressure from the pressure sensor
        int pressureValue = analogRead(PRESSURE_SENSOR_PIN);
        float voltage = pressureValue * (5.0 / 1023.0);
        sensorData.pressure = (voltage - 0.2) * (700 / (4.7 - 0.2)); // Adjust based on calibration

        // Read pH value from the pH sensor
        int pHValue = analogRead(PH_SENSOR_PIN);
        float voltagePH = pHValue * (5.0 / 1023.0);
        sensorData.pH = voltagePH * 3.5; // Adjust based on calibration

        // Print results to Serial Monitor
        Serial.print("Flow Rate: ");
        Serial.print(sensorData.flowRate);
        Serial.println(" L/min");
        
        Serial.print("Total Volume: ");
        Serial.print(sensorData.totalVolume);
        Serial.println(" L");

        Serial.print("Pressure: ");
        Serial.print(sensorData.pressure);
        Serial.println(" kPa");

        Serial.print("pH Level: ");
        Serial.println(sensorData.pH);

        // Reset pulse counter for next calculation
        flowFrequency = 0;
    }
}
