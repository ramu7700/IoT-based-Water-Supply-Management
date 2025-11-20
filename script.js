// Configuration
const API_URL = 'http://YOUR_SERVER_IP/fetch_data.php';
const REFRESH_INTERVAL = 30000; // 30 seconds

// Chart instances
let flowChart, pressureChart, qualityChart, consumptionChart;

// Auto-refresh timer
let refreshTimer;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Water Supply Management System Initialized');
    
    // Initialize charts
    initializeCharts();
    
    // Load initial data
    loadData();
    
    // Start auto-refresh
    startAutoRefresh();
});

// Initialize all charts
function initializeCharts() {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    // Flow Rate Chart
    const flowCtx = document.getElementById('flowChart').getContext('2d');
    flowChart = new Chart(flowCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Flow Rate (L/min)',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: commonOptions
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
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: commonOptions
    });

    // Quality Chart
    const qualityCtx = document.getElementById('qualityChart').getContext('2d');
    qualityChart = new Chart(qualityCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'pH Level',
                data: [],
                borderColor: '#17a2b8',
                backgroundColor: 'rgba(23, 162, 184, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    min: 0,
                    max: 14
                }
            }
        }
    });

    // Consumption Chart
    const consumptionCtx = document.getElementById('consumptionChart').getContext('2d');
    consumptionChart = new Chart(consumptionCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Consumption (Liters)',
                data: [],
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: commonOptions
    });
}

// Load data from API
async function loadData() {
    const period = document.getElementById('periodSelect').value;
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    try {
        // Show loading overlay
        loadingOverlay.classList.add('active');
        
        // Fetch data
        const response = await fetch(`${API_URL}?period=${period}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            updateCharts(result.data);
            updateStatusCards(result.data);
            updateLastUpdateTime();
            console.log(`Loaded ${result.count} records for period: ${period}`);
        } else if (result.data.length === 0) {
            handleEmptyData();
            console.warn('No data available for selected period');
        } else {
            throw new Error(result.error || 'Failed to load data');
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please check your connection and try again.');
    } finally {
        // Hide loading overlay
        loadingOverlay.classList.remove('active');
    }
}

// Update all charts with new data
function updateCharts(data) {
    const labels = data.map(item => formatTimestamp(item.timestamp));
    const flowData = data.map(item => item.water_flow);
    const pressureData = data.map(item => item.pressure);
    const qualityData = data.map(item => item.quality);
    const consumptionData = data.map(item => item.consumption);

    // Update Flow Chart
    flowChart.data.labels = labels;
    flowChart.data.datasets[0].data = flowData;
    flowChart.update('none');

    // Update Pressure Chart
    pressureChart.data.labels = labels;
    pressureChart.data.datasets[0].data = pressureData;
    pressureChart.update('none');

    // Update Quality Chart
    qualityChart.data.labels = labels;
    qualityChart.data.datasets[0].data = qualityData;
    qualityChart.update('none');

    // Update Consumption Chart
    consumptionChart.data.labels = labels;
    consumptionChart.data.datasets[0].data = consumptionData;
    consumptionChart.update('none');
}

// Update status cards with latest values
function updateStatusCards(data) {
    if (data.length === 0) return;
    
    // Get latest reading (last item in array)
    const latest = data[data.length - 1];
    
    document.getElementById('latestFlow').textContent = latest.water_flow.toFixed(2);
    document.getElementById('latestPressure').textContent = latest.pressure.toFixed(2);
    document.getElementById('latestQuality').textContent = latest.quality.toFixed(2);
    document.getElementById('latestConsumption').textContent = latest.consumption.toFixed(2);
}

// Handle empty data scenario
function handleEmptyData() {
    // Clear charts
    [flowChart, pressureChart, qualityChart, consumptionChart].forEach(chart => {
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.update('none');
    });
    
    // Clear status cards
    document.getElementById('latestFlow').textContent = '--';
    document.getElementById('latestPressure').textContent = '--';
    document.getElementById('latestQuality').textContent = '--';
    document.getElementById('latestConsumption').textContent = '--';
    
    showError('No data available for the selected period.');
}

// Format timestamp for display
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const period = document.getElementById('periodSelect').value;
    
    switch(period) {
        case 'last5':
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        case 'daily':
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        case 'weekly':
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit'
            });
        case 'monthly':
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
            });
        default:
            return date.toLocaleString('en-US');
    }
}

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = timeString;
}

// Show error message
function showError(message) {
    // You can enhance this with a toast notification or modal
    console.error(message);
    alert(message);
}

// Start auto-refresh
function startAutoRefresh() {
    refreshTimer = setInterval(() => {
        console.log('Auto-refreshing data...');
        loadData();
    }, REFRESH_INTERVAL);
}

// Stop auto-refresh
function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopAutoRefresh();
        console.log('Auto-refresh paused (page hidden)');
    } else {
        startAutoRefresh();
        loadData();
        console.log('Auto-refresh resumed (page visible)');
    }
});
