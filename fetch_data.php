<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
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
    
    // Get query parameter
    $period = isset($_GET['period']) ? $_GET['period'] : 'last5';
    
    // Build SQL query based on period
    $sql = "SELECT id, water_flow, pressure, quality, consumption, timestamp FROM sensor_data";
    
    switch ($period) {
        case 'daily':
            $sql .= " WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)";
            break;
        case 'weekly':
            $sql .= " WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
            break;
        case 'monthly':
            $sql .= " WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
            break;
        case 'last5':
        default:
            $sql .= " ORDER BY timestamp DESC LIMIT 5";
            break;
    }
    
    // Add ordering if not already limited
    if ($period !== 'last5') {
        $sql .= " ORDER BY timestamp ASC";
    }
    
    // Execute query
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    // Fetch all results
    $data = array();
    
    while ($row = $result->fetch_assoc()) {
        $data[] = array(
            'id' => intval($row['id']),
            'water_flow' => floatval($row['water_flow']),
            'pressure' => floatval($row['pressure']),
            'quality' => floatval($row['quality']),
            'consumption' => floatval($row['consumption']),
            'timestamp' => $row['timestamp']
        );
    }
    
    // Reverse order for last5 to show chronologically
    if ($period === 'last5') {
        $data = array_reverse($data);
    }
    
    // Success response
    $response['success'] = true;
    $response['period'] = $period;
    $response['count'] = count($data);
    $response['data'] = $data;
    
    http_response_code(200);
    
} catch (Exception $e) {
    // Error response
    $response['success'] = false;
    $response['error'] = $e->getMessage();
    $response['data'] = array();
    
    http_response_code(400);
}

// Close connection
if (isset($conn)) {
    $conn->close();
}

// Return JSON response
echo json_encode($response);
?>
