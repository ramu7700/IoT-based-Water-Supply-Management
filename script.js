// Sample data for demonstration purposes
const flowData = [0.39, 2.93, 0.18, 0.27, 0.05]; // Water flow in Cusecs
const pressureData = [159.30, 45.00, 598.59, 98.92, 255.90]; // Pressure in kPa
const qualityData = [7.2, 6.8, 7.0, 7.1, 6.9]; // pH levels
const consumptionData = [30, 62662, 11, 100, 0]; // Consumption in Liters

// Function to create a chart
function createChart(ctx, labels, data) {
    new Chart(ctx, {
        type: 'line', // You can change this to 'bar', 'pie', etc.
        data: {
            labels: labels,
            datasets: [{
                label: 'Measurement',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            tooltips: {
                enabled: true,
                mode: 'index',
                intersect: false,
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}

// Create charts with example data
window.onload = () => {
    const labels = ['Entry 1', 'Entry 2', 'Entry 3', 'Entry 4', 'Entry 5'];

    const flowCtx = document.getElementById('flowChart').getContext('2d');
    createChart(flowCtx, labels, flowData);

    const pressureCtx = document.getElementById('pressureChart').getContext('2d');
    createChart(pressureCtx, labels, pressureData);

    const qualityCtx = document.getElementById('qualityChart').getContext('2d');
    createChart(qualityCtx, labels, qualityData);

    const consumptionCtx = document.getElementById('consumptionChart').getContext('2d');
    createChart(consumptionCtx, labels, consumptionData);
};