<?php
// fetch_data.php - Water Supply Management System Data Retrieval Script

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Database credentials
$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "water_supply_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Determine time filter
$period = isset($_GET['period']) ? $_GET['period'] : '';
$where = "";
switch ($period) {
    case 'daily':
        $where = "WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)";
        break;
    case 'weekly':
        $where = "WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
        break;
    case 'monthly':
        $where = "WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
        break;
    default:
        // No filter—just limit to last 5 entries
        break;
}

// Base query
$sql = "SELECT water_flow, pressure, quality, consumption, timestamp
        FROM sensor_data
        $where
        ORDER BY timestamp DESC";

if ($period === '') {
    $sql .= " LIMIT 5";
}

$result = $conn->query($sql);
if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "Query failed: " . $conn->error]);
    exit();
}

// Build output array
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        "water_flow"  => (float)$row["water_flow"],
        "pressure"    => (float)$row["pressure"],
        "quality"     => (float)$row["quality"],
        "consumption" => (float)$row["consumption"],
        "timestamp"   => $row["timestamp"]
    ];
}

// Return JSON
echo json_encode($data);
$conn->close();
?>
