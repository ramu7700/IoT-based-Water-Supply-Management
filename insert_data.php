<?php
// insert_data.php - Water Supply Management System Data Insertion Script

// Set response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$servername = "localhost";
$username = "root";          // Your MySQL username
$password = "";              // Your MySQL password (empty for default XAMPP)
$dbname = "water_supply_db"; // Your database name

// Create database connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database connection failed: " . $conn->connect_error,
        "timestamp" => date('Y-m-d H:i:s')
    ]);
    exit();
}

// Set charset to utf8
$conn->set_charset("utf8");

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "error" => "Method not allowed. Only POST requests are accepted.",
        "method_received" => $_SERVER['REQUEST_METHOD']
    ]);
    exit();
}

// Get JSON data from request body
$json_input = file_get_contents('php://input');

// Check if input is empty
if (empty($json_input)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Empty request body. JSON data required."
    ]);
    exit();
}

// Decode JSON data
$data = json_decode($json_input, true);

// Check for JSON decode errors
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Invalid JSON format: " . json_last_error_msg()
    ]);
    exit();
}

// Validate required input data
$required_fields = ['flowRate', 'pressure', 'pH'];
$missing_fields = [];

foreach ($required_fields as $field) {
    if (!isset($data[$field]) || $data[$field] === null || $data[$field] === '') {
        $missing_fields[] = $field;
    }
}

if (!empty($missing_fields)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Missing required fields: " . implode(', ', $missing_fields),
        "required_fields" => $required_fields,
        "received_data" => array_keys($data)
    ]);
    exit();
}

// Extract and validate data types
$flowRate = filter_var($data['flowRate'], FILTER_VALIDATE_FLOAT);
$pressure = filter_var($data['pressure'], FILTER_VALIDATE_FLOAT);
$pH = filter_var($data['pH'], FILTER_VALIDATE_FLOAT);

// Validate data ranges
$validation_errors = [];

if ($flowRate === false || $flowRate < 0) {
    $validation_errors[] = "flowRate must be a valid positive number";
}

if ($pressure === false || $pressure < 0) {
    $validation_errors[] = "pressure must be a valid positive number";
}

if ($pH === false || $pH < 0 || $pH > 14) {
    $validation_errors[] = "pH must be a valid number between 0 and 14";
}

if (!empty($validation_errors)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Data validation failed",
        "validation_errors" => $validation_errors
    ]);
    exit();
}

// Calculate consumption (you can adjust this logic based on your requirements)
// Assuming 10-minute intervals, consumption = flowRate * 10 minutes
$consumption = $flowRate * 10;

// Get current timestamp
$timestamp = date('Y-m-d H:i:s');

// Prepare SQL statement
$sql = "INSERT INTO sensor_data (water_flow, pressure, quality, consumption, timestamp) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "SQL prepare failed: " . $conn->error
    ]);
    exit();
}

// Bind parameters (d = double/float, s = string)
$stmt->bind_param("dddds", $flowRate, $pressure, $pH, $consumption, $timestamp);

// Execute the statement
if ($stmt->execute()) {
    // Get the inserted record ID
    $inserted_id = $stmt->insert_id;
    
    // Success response
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Sensor data inserted successfully",
        "record_id" => $inserted_id,
        "data" => [
            "water_flow" => round($flowRate, 2),
            "pressure" => round($pressure, 2),
            "quality" => round($pH, 2),
            "consumption" => round($consumption, 2),
            "timestamp" => $timestamp
        ],
        "server_time" => date('Y-m-d H:i:s'),
        "processing_time_ms" => (microtime(true) - $_SERVER["REQUEST_TIME_FLOAT"]) * 1000
    ]);
} else {
    // Error response
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database insert failed: " . $stmt->error,
        "sql_state" => $stmt->sqlstate
    ]);
}

// Close statement and connection
$stmt->close();
$conn->close();

// Log successful insertions (optional)
if (isset($inserted_id)) {
    error_log("Water sensor data inserted - ID: $inserted_id, Flow: $flowRate, Pressure: $pressure, pH: $pH");
}
?>
