<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "water_supply_db";

// Response array
$response = array();

try {
    // Create database connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    
    // Get JSON input
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);
    
    // Validate JSON
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON format: " . json_last_error_msg());
    }
    
    // Validate required fields
    if (!isset($data['flowRate']) || !isset($data['pressure']) || !isset($data['pH'])) {
        throw new Exception("Missing required fields: flowRate, pressure, pH");
    }
    
    // Extract and validate data
    $flowRate = floatval($data['flowRate']);
    $pressure = floatval($data['pressure']);
    $pH = floatval($data['pH']);
    
    // Validate flowRate
    if ($flowRate < 0) {
        throw new Exception("Invalid flowRate: must be >= 0");
    }
    
    // Validate pressure
    if ($pressure < 0) {
        throw new Exception("Invalid pressure: must be >= 0");
    }
    
    // Validate pH
    if ($pH < 0 || $pH > 14) {
        throw new Exception("Invalid pH: must be between 0 and 14");
    }
    
    // Calculate consumption (flowRate × 10 minutes)
    $consumption = $flowRate * 10.0;
    
    // Prepare SQL statement
    $stmt = $conn->prepare("INSERT INTO sensor_data (water_flow, pressure, quality, consumption, timestamp) VALUES (?, ?, ?, ?, NOW())");
    
    if (!$stmt) {
        throw new Exception("Prepare statement failed: " . $conn->error);
    }
    
    $stmt->bind_param("dddd", $flowRate, $pressure, $pH, $consumption);
    
    // Execute query
    if ($stmt->execute()) {
        $record_id = $stmt->insert_id;
        
        // Get the inserted timestamp
        $result = $conn->query("SELECT timestamp FROM sensor_data WHERE id = $record_id");
        $row = $result->fetch_assoc();
        $timestamp = $row['timestamp'];
        
        // Success response
        $response['success'] = true;
        $response['message'] = "Data inserted successfully";
        $response['record_id'] = $record_id;
        $response['data'] = array(
            'water_flow' => $flowRate,
            'pressure' => $pressure,
            'quality' => $pH,
            'consumption' => $consumption,
            'timestamp' => $timestamp
        );
        
        http_response_code(200);
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    // Error response
    $response['success'] = false;
    $response['error'] = $e->getMessage();
    $response['timestamp'] = date('Y-m-d H:i:s');
    
    http_response_code(400);
}

// Close connection
if (isset($conn)) {
    $conn->close();
}

// Return JSON response
echo json_encode($response, JSON_PRETTY_PRINT);
?>
