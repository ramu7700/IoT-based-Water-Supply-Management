<?php
$servername = "localhost";
$username = "root"; // Your MySQL username
$password = ""; // Your MySQL password
$dbname = "water_supply_db"; // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the period parameter from the request (optional)
$period = isset($_GET['period']) ? $_GET['period'] : '';

// Adjust SQL query based on the period if needed
$sql = "SELECT water_flow, pressure, quality, consumption FROM sensor_data ORDER BY timestamp DESC LIMIT 5"; // Default query

// Execute query and fetch results
$result = $conn->query($sql);

$data = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = $row; // Store each row in an array
    }
}
echo json_encode($data); // Return JSON response

$conn->close();
?>