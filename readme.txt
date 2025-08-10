Project Overview: Water Supply Management Dashboard

The Water Supply Management Dashboard is an online application created to effectively monitor and manage water resources. This dashboard offers real-time data visualization for essential metrics, which include:

- Water Flow: This metric measures the volume of water flowing through different reservoirs.
- Pressure: This feature monitors the pressure levels within the water supply system.
- Water Quality: This assesses the pH levels of the water.
- Consumption: This tracks water usage over a period of time.

Key Features
- Real-Time Monitoring: Users are able to view live data from several reservoirs, ensuring they have the most current information available.
- Predictive Analytics: The system predicts future water demand based on historical data and seasonal patterns, facilitating improved resource allocation and maintenance planning.
- User-Friendly Interface: Developed with Bootstrap, the dashboard is responsive and easy to navigate across various devices.
- Dynamic Data Fetching: AJAX technology is utilized to obtain data from a MySQL database without the need to refresh the page.

---

Arduino Code Overview

The Arduino code plays a vital role in collecting data from various sensors integrated into the water supply system. Below is a summary of your implementation:

Key Components of the Arduino Code

1. Sensor Initialization:
   - The code initializes sensors designed to measure water flow, pressure, and pH levels, linking them to designated GPIO pins on the Arduino.

2. Data Collection:
   - It captures sensor data at consistent intervals (for instance, every 10 minutes), calculating flow rates and converting analog readings from pressure and pH sensors into actionable values.

3. Data Formatting:
   - The gathered data is structured into a JSON payload that encompasses flow rate, pressure, pH level, and consumption metrics.

4. Data Transmission:
   - The Arduino establishes a Wi-Fi connection using the provided credentials and transmits the JSON payload to a PHP script hosted on a local server (XAMPP) through HTTP POST requests.

5. Error Handling:
   - The code incorporates mechanisms to manage errors during data transmission, ensuring dependable operation.

 Example Code Snippet

Here’s a simplified example of your Arduino code:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "your_SSID";
const char* password = "your_PASSWORD";
const char* serverUrl = "http://localhost/fetch_data.php";

void setup() {
    // Initialize sensors and Wi-Fi connection
}

void loop() {
    // Read sensor values
    float flowRate = readFlowSensor();
    float pressure = readPressureSensor();
    float pH = readPHsensor();

    // Prepare JSON payload
    String payload = "{\"flowRate\":" + String(flowRate) +
                     ",\"pressure\":" + String(pressure) +
                     ",\"pH\":" + String(pH) + "}";

    // Send data to server
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        int httpResponseCode = http.POST(payload);
        http.end();
    }

    delay(600000); // Wait for 10 minutes
}
```

---

Summary of Achievements

1. Environment Setup: Installed XAMPP for managing the local server.
2. Database Creation: Created a MySQL database (`water_supply_db`) with a table (`reservoir_data`) designated for storing sensor data.
3. Dashboard Development: Constructed a web-based dashboard utilizing HTML, CSS (Bootstrap), and JavaScript (Chart.js) for data visualization.
4. Arduino Code Implementation: Created Arduino code to gather sensor data and transmit it to the server.
This project effectively integrates hardware and software components to create a comprehensive solution for managing water resources.


If you have any further questions or need additional details about specific components or functionalities, feel free to ask!
