Water Supply Management System
A comprehensive IoT-driven water supply monitoring solution utilizing ESP32, PHP APIs, MySQL database, and a real-time web dashboard.

📋 Table of Contents

1. System Overview
2. Features
3. System Architecture
4. Hardware Requirements
5. Software Requirements
6. Installation Guide
7. Configuration
8. Usage
9. API Documentation
10. Troubleshooting
11. Security Considerations

System Overview
This system continuously monitors water supply parameters in real-time through sensors linked to an ESP32 microcontroller. The data is sent to a PHP backend, where it is stored in a MySQL database and visualized via a responsive web dashboard.
Monitored Parameters:

Water flow rate (L/min)
Pressure (kPa)
Water quality (pH)
Consumption (Liters)

Features
ESP32 Firmware

Pulse-based flow sensor measurement (7.5 pulses = 1 L/min)
Pressure sensor (0.2–4.7V = 0–700 kPa)
pH sensor featuring linear voltage conversion
Data collection occurs every 10 minutes
WiFi connectivity with automatic reconnection
HTTP POST utilizing JSON payload
Retry mechanism for unsuccessful transmissions
Serial monitoring available for debugging

PHP Backend

RESTful API endpoints provided
JSON input and output formats
Data validation and sanitization processes
Automatic calculation of consumption
Period-based data retrieval options (last 5, daily, weekly, monthly)
Error handling and logging mechanisms

Web Dashboard

Real-time visualization of data
Four interactive Chart.js line graphs
Status cards displaying the most recent readings
Automatic refresh every 30 seconds
Period selection options (last 5, daily, weekly, monthly)
Responsive design using Bootstrap
Attractive gradient header and card animations

Database

MySQL with an indexed timestamp column
Automatic recording of timestamps
Sample test data is included
Optimized for queries related to time-series data


System Architecture

┌─────────────┐      HTTP POST       ┌──────────────┐
│   ESP32     │ ──────────────────> │   PHP API    │
│  (Sensors)  │   (JSON Payload)     │ insert_data  │
└─────────────┘                      └──────┬───────┘
                                            │
                                            ▼
                                     ┌─────────────┐
                                     │   MySQL     │
                                     │  Database   │
                                     └──────┬──────┘
                                            │
                                            ▼
┌─────────────┐      HTTP GET        ┌──────────────┐
│     Web     │ <──────────────────  │   PHP API    │
│  Dashboard  │   (JSON Response)    │  fetch_data  │
└─────────────┘                      └──────────────┘


Hardware Specifications

ESP32 Configuration

ESP32 Development Board (ESP32-WROOM-32 or an equivalent)
Flow Sensor (YF-S201 or a comparable pulse-based sensor)
Pressure Sensor (0.5-4.5V analog output, with a range of 0-700 kPa)
pH Sensor Module (providing analog output)
Power Supply (minimum 5V, 2A)
Breadboard along with jumper wires

Pin Connections

ESP32 Pin    →    Component
────────────────────────────
GPIO 4       →    Flow Sensor (Signal)
GPIO 34      →    Pressure Sensor (Analog)
GPIO 35      →    pH Sensor (Analog)
3.3V         →    Sensor VCC (if applicable)
GND          →    Sensor GND


Software Requirements

Server Requirements

Web Server: Apache 2.4+ or Nginx
PHP: Version 7.4 or higher
MySQL: Version 5.7 or higher

PHP Extensions:

mysqli
json


ESP32 Development

Arduino IDE: Version 1.8.13+
ESP32 Board Package: Version 2.0.0+
Libraries:

WiFi (built-in)
HTTPClient (built-in)
ArduinoJson (6.19.4+)


Web Dashboard

Modern web browser (Chrome, Firefox, Safari, Edge)
Internet connection for CDN resources

Installation Guide
Step 1: Database Setup

Access MySQL:

bash   mysql -u root -p

Create Database and Import Schema:

bash   mysql -u root -p < database.sql

Verify Installation:

sql   USE water_supply_db;
   SHOW TABLES;
   SELECT COUNT(*) FROM sensor_data;
Step 2: PHP Backend Setup

Copy PHP files to web server:

bash   # For Apache on Ubuntu/Debian
   sudo cp insert_data.php /var/www/html/
   sudo cp fetch_data.php /var/www/html/
   
   # Set permissions
   sudo chmod 644 /var/www/html/*.php

Configure database credentials in PHP files:
Edit both insert_data.php and fetch_data.php:

php   $servername = "localhost";
   $username = "root";           // Change to your MySQL username
   $password = "your_password";   // Change to your MySQL password
   $dbname = "water_supply_db";

Test API endpoints:

bash   # Test insert API
   curl -X POST http://YOUR_SERVER_IP/insert_data.php \
        -H "Content-Type: application/json" \
        -d '{"flowRate":15.5,"pressure":450.0,"pH":7.2}'
   
   # Test fetch API
   curl http://YOUR_SERVER_IP/fetch_data.php?period=last5
Step 3: Web Dashboard Setup

Copy dashboard files to web server:

bash   sudo cp index.html /var/www/html/
   sudo cp style.css /var/www/html/
   sudo cp script.js /var/www/html/

Update API URL in script.js:

javascript   const API_URL = 'http://YOUR_SERVER_IP/fetch_data.php';

Access dashboard:
Open browser: http://YOUR_SERVER_IP/index.html

Step 4: ESP32 Setup

Install Arduino IDE and ESP32 Board:

Download Arduino IDE from arduino.cc
Add ESP32 board URL in Preferences:



     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

Install ESP32 board from Board Manager


Install Required Libraries:

Open Arduino IDE
Go to Sketch → Include Library → Manage Libraries
Search and install: ArduinoJson (by Benoit Blanchon)


Configure ESP32 Code:
Open allsensors.ino and update:

cpp   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   const char* serverUrl = "http://YOUR_SERVER_IP/insert_data.php";

Upload to ESP32:

Select Board: Tools → Board → ESP32 Dev Module
Select Port: Tools → Port → (your ESP32 port)
Click Upload button
Open Serial Monitor (115200 baud) to view status




Configuration
ESP32 Sensor Calibration
Flow Sensor:
cppfloat calibrationFactor = 7.5; // Adjust based on your sensor
Pressure Sensor:
cpp// Adjust voltage range and pressure mapping
float pressure = ((voltage - 0.2) / (4.7 - 0.2)) * 700.0;
pH Sensor:
cpp// Calibrate using pH 4, 7, and 10 buffer solutions
float pH = (voltage / 3.3) * 14.0;
Data Collection Interval
Default: 10 minutes (600,000 ms)
cppif (currentTime - lastReadTime >= 600000) {
    // Change to desired interval in milliseconds
}
Auto-Refresh Interval (Dashboard)
Default: 30 seconds
javascriptconst REFRESH_INTERVAL = 30000; // Change in milliseconds


Usage
Starting the System

Power on ESP32 with sensors connected
Monitor Serial output for connection status
Access dashboard at http://YOUR_SERVER_IP/index.html
Select time period from dropdown to view historical data

Reading Serial Monitor
=== Water Supply Management System ===
Initializing...
Connecting to WiFi: YourNetwork
...........
WiFi Connected!
IP Address: 192.168.1.100
System Ready!

--- Reading Sensors ---
Flow Rate: 15.50 L/min
Pressure: 450.00 kPa
pH Level: 7.20
Consumption (10 min): 155.00 L
Total Volume: 155 L

Sending data to server...
JSON Payload: {"flowRate":15.5,"pressure":450,"pH":7.2,"consumption":155}
HTTP Response Code: 200
Server Response: {"success":true,...}
✓ Data sent successfully!

API Documentation
POST /insert_data.php
Insert sensor readings into database.
Request:
json{
  "flowRate": 15.5,
  "pressure": 450.0,
  "pH": 7.2
}
Response (Success):
json{
  "success": true,
  "message": "Data inserted successfully",
  "record_id": 123,
  "data": {
    "water_flow": 15.5,
    "pressure": 450.0,
    "quality": 7.2,
    "consumption": 155.0,
    "timestamp": "2025-01-20 14:30:00"
  }
}
Response (Error):
json{
  "success": false,
  "error": "Invalid pH: must be between 0 and 14",
  "timestamp": "2025-01-20 14:30:00"
}
GET /fetch_data.php
Retrieve sensor data for specified period.
Parameters:

period (optional): last5 | daily | weekly | monthly

Default: last5



Request:
GET /fetch_data.php?period=daily
Response:
json{
  "success": true,
  "period": "daily",
  "count": 24,
  "data": [
    {
      "id": 1,
      "water_flow": 15.5,
      "pressure": 450.0,
      "quality": 7.2,
      "consumption": 155.0,
      "timestamp": "2025-01-20 14:00:00"
    },
    ...
  ]
}

Troubleshooting
ESP32 Issues
Problem: Cannot connect to WiFi
Solution:
1. Verify SSID and password
2. Check WiFi signal strength
3. Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
4. Check router MAC filtering
Problem: HTTP POST fails
Solution:
1. Verify server URL and IP address
2. Check if server is accessible from network
3. Test API manually with curl
4. Check firewall settings
5. Verify PHP file permissions
Problem: Incorrect sensor readings
Solution:
1. Check sensor connections and power supply
2. Calibrate sensors using known values
3. Verify voltage levels with multimeter
4. Adjust calibration factors in code
Dashboard Issues
Problem: Charts not displaying
Solution:
1. Check browser console for errors (F12)
2. Verify API URL in script.js
3. Test API endpoint manually
4. Check CORS headers in PHP
5. Clear browser cache
Problem: No data showing
Solution:
1. Verify database has records
2. Check PHP error logs
3. Ensure correct period selected
4. Test fetch_data.php directly in browser
Database Issues
Problem: Connection failed
Solution:
1. Verify MySQL is running: sudo systemctl status mysql
2. Check credentials in PHP files
3. Grant proper permissions:
   GRANT ALL ON water_supply_db.* TO 'root'@'localhost';
4. Check MySQL error logs

Security Considerations
Production Deployment

Change default database credentials:

sql   CREATE USER 'water_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT SELECT, INSERT ON water_supply_db.* TO 'water_user'@'localhost';

Enable HTTPS:

Install SSL certificate (Let's Encrypt recommended)
Update ESP32 code to use HTTPS
Update dashboard API URL to HTTPS


Implement authentication:

Add API key validation in PHP
Use token-based authentication
Implement rate limiting


SQL Injection Prevention:

Already implemented using prepared statements
Never concatenate user input in SQL


Input Validation:

Already implemented in insert_data.php
Validate all incoming data


Error Handling:

Don't expose sensitive error messages in production
Log errors to file instead of displaying




Data Analysis
Query Examples
Average consumption per day:
sqlSELECT DATE(timestamp) as date, 
       AVG(consumption) as avg_consumption
FROM sensor_data
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(timestamp);
Peak flow hours:
sqlSELECT HOUR(timestamp) as hour,
       AVG(water_flow) as avg_flow
FROM sensor_data
GROUP BY HOUR(timestamp)
ORDER BY avg_flow DESC;
pH level trends:
sqlSELECT DATE(timestamp) as date,
       MIN(quality) as min_ph,
       MAX(quality) as max_ph,
       AVG(quality) as avg_ph
FROM sensor_data
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(timestamp);

Learning Resources

ESP32 Documentation: https://docs.espressif.com/
PHP MySQL Tutorial: https://www.php.net/manual/en/book.mysqli.php
Chart.js Documentation: https://www.chartjs.org/docs/
Arduino JSON Library: https://arduinojson.org/


License
This project is open-source and available for educational and commercial use.

Contributing
Contributions are welcome! Feel free to:

Report bugs
Suggest new features
Submit pull requests
Improve documentation


Support
For issues and questions:

Check the troubleshooting section
Review error logs
Test each component individually
Contact system administrator


Acknowledgments
Built with:

ESP32 by Espressif
Arduino IDE
Chart.js
Bootstrap
PHP & MySQL
