<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "root"; // Your MySQL username
$password = ""; // Your MySQL password
$dbname = "water_supply_db"; // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

// Get JSON data from request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input data
if (!$data || !isset($data['flowRate']) || !isset($data['pressure']) || !isset($data['pH'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid input data"]);
    exit();
}

// Extract data
$flowRate = floatval($data['flowRate']);
$pressure = floatval($data['pressure']);
$pH = floatval($data['pH']);

// Calculate consumption (you can adjust this logic based on your requirements)
$consumption = $flowRate * 10; // Example: flow rate * 10 minutes

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO sensor_data (water_flow, pressure, quality, consumption) VALUES (?, ?, ?, ?)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Prepare failed: " . $conn->error]);
    exit();
}

$stmt->bind_param("dddd", $flowRate, $pressure, $pH, $consumption);

// Execute the statement
if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Data inserted successfully",
        "data" => [
            "water_flow" => $flowRate,
            "pressure" => $pressure,
            "quality" => $pH,
            "consumption" => $consumption
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Execute failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
