// Chart.js configuration
let financialChart;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeChart();
    setupEventListeners();
});

// Initialize Chart.js
function initializeChart() {
    const ctx = document.getElementById('financialChart').getContext('2d');
    
    // Sample data for 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const sampleRevenue = [3200, 3400, 3100, 3600, 3800, 3500];
    const sampleExpenses = [2800, 2850, 2750, 2900, 2950, 2850];
    
    financialChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Monthly Revenue',
                    data: sampleRevenue,
                    backgroundColor: 'rgba(20, 184, 166, 0.8)', // teal
                    borderColor: 'rgba(20, 184, 166, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                },
                {
                    label: 'Monthly Expenses',
                    data: sampleExpenses,
                    backgroundColor: 'rgba(107, 114, 128, 0.8)', // gray
                    borderColor: 'rgba(107, 114, 128, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#374151',
                    bodyColor: '#374151',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(229, 231, 235, 0.5)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add input validation to all number inputs
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('input', (e) => {
            validateNumberInput(e.target);
        });
    });

    // Form submission
    document.getElementById('calculatorForm').addEventListener('submit', handleFormSubmission);
}

// Function to validate number input
function validateNumberInput(input) {
    const value = input.value;
    const isValid = /^\d*\.?\d*$/.test(value);
    
    if (!isValid) {
        input.classList.add('error');
        input.nextElementSibling.style.display = 'block';
        return false;
    } else {
        input.classList.remove('error');
        input.nextElementSibling.style.display = 'none';
        return true;
    }
}

// Handle form submission
function handleFormSubmission(e) {
    e.preventDefault();
    
    // Validate all inputs before proceeding
    const inputs = document.querySelectorAll('.form-input');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateNumberInput(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        return;
    }
    
    const formData = {
        monthlyRent: parseFloat(document.getElementById('monthlyRent').value) || 0,
        utilities: parseFloat(document.getElementById('utilities').value) || 0,
        furnishingCost: parseFloat(document.getElementById('furnishingCost').value) || 0,
        cleaningFee: parseFloat(document.getElementById('cleaningFee').value) || 0,
        airbnbFeePercentage: parseFloat(document.getElementById('airbnbFeePercentage').value) || 0,
        averageDailyRate: parseFloat(document.getElementById('averageDailyRate').value) || 0,
        occupancyRate: parseFloat(document.getElementById('occupancyRate').value) || 0,
        averageLengthOfStay: parseFloat(document.getElementById('averageLengthOfStay').value) || 0,
        otherExpenses: parseFloat(document.getElementById('otherExpenses').value) || 0
    };

    try {
        const results = calculateAirbnbMetrics(formData);
        updateResults(results, formData);
    } catch (error) {
        alert('Error calculating results. Please check your inputs and try again.');
    }
}

// Calculate Airbnb metrics
function calculateAirbnbMetrics({
    monthlyRent,
    utilities,
    furnishingCost,
    cleaningFee,
    airbnbFeePercentage,
    averageDailyRate,
    occupancyRate,
    averageLengthOfStay,
    otherExpenses
}) {
    // Calculate monthly metrics
    const grossMonthlyRevenue = averageDailyRate * (occupancyRate / 100) * 30;
    const airbnbFees = grossMonthlyRevenue * (airbnbFeePercentage / 100);
    const monthlyCleaningCost = cleaningFee * ((occupancyRate / 100) * 30) / averageLengthOfStay;
    
    // Calculate total expenses and profit
    const totalMonthlyExpenses = (
        monthlyRent +
        utilities +
        monthlyCleaningCost +
        airbnbFees +
        otherExpenses
    );
    
    const netMonthlyProfit = grossMonthlyRevenue - totalMonthlyExpenses;
    
    // Calculate furnishing payback period
    const furnishingPaybackPeriod = netMonthlyProfit > 0 ? furnishingCost / netMonthlyProfit : Infinity;
    
    return {
        grossMonthlyRevenue,
        airbnbFees,
        monthlyCleaningCost,
        totalMonthlyExpenses,
        netMonthlyProfit,
        furnishingPaybackPeriod
    };
}

// Update all results and charts
function updateResults(results, formData) {
    // Update results with animations
    const resultElements = document.querySelectorAll('#results > div');
    resultElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('animate-fade-in-up');
        }, index * 100);
    });
    
    // Update revenue section
    document.getElementById('grossRevenue').textContent = `$${results.grossMonthlyRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('airbnbFees').textContent = `$${results.airbnbFees.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // Update expenses section
    document.getElementById('monthlyRentDisplay').textContent = `$${formData.monthlyRent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('utilitiesDisplay').textContent = `$${formData.utilities.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('cleaningCost').textContent = `$${results.monthlyCleaningCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('otherExpensesDisplay').textContent = `$${formData.otherExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('totalExpenses').textContent = `$${results.totalMonthlyExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // Update profit section
    const netProfitElement = document.getElementById('netProfit');
    netProfitElement.textContent = `$${results.netMonthlyProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    netProfitElement.className = results.netMonthlyProfit >= 0 ? 'text-2xl font-bold profit-positive' : 'text-2xl font-bold profit-negative';
    
    document.getElementById('paybackPeriod').textContent = 
        results.furnishingPaybackPeriod === Infinity ? 'Never (negative profit)' : 
        `${results.furnishingPaybackPeriod.toFixed(1)} months`;
    
    // Update charts
    updateOccupancyChart(formData.occupancyRate);
    updateBreakEvenProgress(results.furnishingPaybackPeriod);
    updateFinancialChart(results.grossMonthlyRevenue, results.totalMonthlyExpenses);
}

// Update occupancy chart
function updateOccupancyChart(occupancyRate) {
    const chart = document.getElementById('occupancyChart');
    const display = document.getElementById('occupancyDisplay');
    const rotation = (occupancyRate / 100) * 360;
    
    chart.style.transform = `rotate(${rotation}deg)`;
    display.textContent = occupancyRate.toFixed(1);
}

// Update break-even progress bar
function updateBreakEvenProgress(paybackPeriod) {
    const progress = document.getElementById('breakEvenProgress');
    const text = document.getElementById('breakEvenText');
    
    if (paybackPeriod === Infinity) {
        progress.style.width = '0%';
        text.textContent = 'Break-even: Never (negative profit)';
    } else {
        const progressPercent = Math.min((paybackPeriod / 24) * 100, 100); // 24 months max
        progress.style.width = `${progressPercent}%`;
        text.textContent = `Break-even: ${paybackPeriod.toFixed(1)} months`;
    }
}

// Update financial chart
function updateFinancialChart(monthlyRevenue, monthlyExpenses) {
    // Update the chart with new calculated values
    const newRevenueData = Array(6).fill(monthlyRevenue);
    const newExpensesData = Array(6).fill(monthlyExpenses);
    
    financialChart.data.datasets[0].data = newRevenueData;
    financialChart.data.datasets[1].data = newExpensesData;
    financialChart.update('active');
} 