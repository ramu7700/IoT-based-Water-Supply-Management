// script.js - Fetch sensor data and update Chart.js charts

// Chart instances (must be initialized earlier via initializeCharts())
let flowChart, pressureChart, qualityChart, consumptionChart;

// Called on page load
function fetchData(period) {
    const url = period
      ? `fetch_data.php?period=${encodeURIComponent(period)}`
      : 'fetch_data.php';

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                console.warn('No data received');
                return;
            }
            updateCharts(data);
            updateStatus(data[0]);
        })
        .catch(err => {
            console.error('Error fetching data:', err);
        });
}

// Update all four charts
function updateCharts(dataArray) {
    // Reverse so oldest first
    const data = [...dataArray].reverse();
    
    const labels = data.map((d, i) => d.timestamp);
    const flowData = data.map(d => d.water_flow);
    const pressureData = data.map(d => d.pressure);
    const qualityData = data.map(d => d.quality);
    const consumptionData = data.map(d => d.consumption);

    setChartData(flowChart, labels, flowData);
    setChartData(pressureChart, labels, pressureData);
    setChartData(qualityChart, labels, qualityData);
    setChartData(consumptionChart, labels, consumptionData);
}

// Helper to update one chart
function setChartData(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

// Display latest readings in a status panel
function updateStatus(latest) {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;
    statusEl.innerHTML = `
        <div class="alert alert-info">
            <strong>Latest Readings:</strong><br>
            Flow: ${latest.water_flow.toFixed(2)} L/min<br>
            Pressure: ${latest.pressure.toFixed(2)} kPa<br>
            pH: ${latest.quality.toFixed(2)}<br>
            Consumption: ${latest.consumption.toFixed(2)} L
        </div>`;
}

// Bind period selector
document.getElementById('timePeriod').addEventListener('change', function(){
    fetchData(this.value);
});

// Auto-refresh every 30 seconds
setInterval(() => {
    const period = document.getElementById('timePeriod').value;
    fetchData(period);
}, 30000);

// Initial load (last 5 entries)
fetchData('');
