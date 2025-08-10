// Chart instances
let flowChart, pressureChart, qualityChart, consumptionChart;

// Initialize charts on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    fetchData(''); // Fetch initial data
    
    // Auto-refresh data every 30 seconds
    setInterval(() => {
        const selectedPeriod = document.getElementById('timePeriod').value;
        fetchData(selectedPeriod);
    }, 30000);
});

function initializeCharts() {
    // Flow Chart
    const flowCtx = document.getElementById('flowChart').getContext('2d');
    flowChart = new Chart(flowCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Flow Rate (L/min)',
                data: [],
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'L/min'
                    }
                }
            }
        }
    });

    // Pressure Chart
    const pressureCtx = document.getElementById('pressureChart').getContext('2d');
    pressureChart = new Chart(pressureCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Pressure (kPa)',
                data: [],
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kPa'
                    }
                }
            }
        }
    });

    // Quality Chart (pH)
    const qualityCtx = document.getElementById('qualityChart').getContext('2d');
    qualityChart = new Chart(qualityCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'pH Level',
                data: [],
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    min: 0,
                    max: 14,
                    title: {
                        display: true,
                        text: 'pH'
                    }
                }
            }
        }
    });

    // Consumption Chart
    const consumptionCtx = document.getElementById('consumptionChart').getContext('2d');
    consumptionChart = new Chart(consumptionCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Water Consumption (L)',
                data: [],
                backgroundColor: '#ffc107',
                borderColor: '#ffc107'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Liters'
                    }
                }
            }
        }
    });
}

function fetchData(period) {
    const url = period ? `fetch_data.php?period=${period}` : 'fetch_data.php';
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            updateCharts(data);
            updateStatus(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            showError('Failed to fetch sensor data');
        });
}

function updateCharts(data) {
    if (!data || data.length === 0) {
        showError('No data available');
        return;
    }

    // Reverse data to show chronological order
    const reversedData = data.reverse();
    
    // Extract data for charts
    const labels = reversedData.map((item, index) => `Reading ${index + 1}`);
    const flowData = reversedData.map(item => parseFloat(item.water_flow) || 0);
    const pressureData = reversedData.map(item => parseFloat(item.pressure) || 0);
    const qualityData = reversedData.map(item => parseFloat(item.quality) || 0);
    const consumptionData = reversedData.map(item => parseFloat(item.consumption) || 0);

    // Update charts
    updateChart(flowChart, labels, flowData);
    updateChart(pressureChart, labels, pressureData);
    updateChart(qualityChart, labels, qualityData);
    updateChart(consumptionChart, labels, consumptionData);
}

function updateChart(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

function updateStatus(data) {
    if (!data || data.length === 0) return;
    
    const latestData = data[0];
    const statusElement = document.getElementById('status');
    
    if (statusElement) {
        let statusHtml = `
            <div class="alert alert-info">
                <h5>Latest Readings:</h5>
                <p><strong>Flow Rate:</strong> ${parseFloat(latestData.water_flow).toFixed(2)} L/min</p>
                <p><strong>Pressure:</strong> ${parseFloat(latestData.pressure).toFixed(2)} kPa</p>
                <p><strong>pH Level:</strong> ${parseFloat(latestData.quality).toFixed(2)}</p>
                <p><strong>Consumption:</strong> ${parseFloat(latestData.consumption).toFixed(2)} L</p>
            </div>
        `;
        statusElement.innerHTML = statusHtml;
    }
}

function showError(message) {
    console.error(message);
    
    // Create error alert if it doesn't exist
    let errorAlert = document.getElementById('errorAlert');
    if (!errorAlert) {
        errorAlert = document.createElement('div');
        errorAlert.id = 'errorAlert';
        errorAlert.className = 'alert alert-danger alert-dismissible fade show';
        errorAlert.innerHTML = `
            <span id="errorMessage"></span>
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        `;
        document.querySelector('.container').prepend(errorAlert);
    }
    
    document.getElementById('errorMessage').textContent = message;
    errorAlert.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (errorAlert) {
            errorAlert.style.display = 'none';
        }
    }, 5000);
}
