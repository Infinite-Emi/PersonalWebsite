let salesChartInstance; // Holds the sales chart object to prevent re-rendering.

/**
 * Opens a modal by its ID.
 * @param {string} modalId - The ID of the modal to open.
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling.

    // Render the sales chart only if it's the sales modal and the chart doesn't exist yet.
    if (modalId === 'salesModal' && !salesChartInstance) {
        renderSalesChart();
    }
}

/**
 * Closes a modal by its ID.
 * @param {string} modalId - The ID of the modal to close.
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('opacity-0', 'pointer-events-none');
    // Hides the modal after the fade-out transition completes.
    modal.addEventListener('transitionend', function handler() {
        modal.style.display = 'none';
        modal.removeEventListener('transitionend', handler);
    });
    document.body.style.overflow = 'auto'; // Restore background scrolling.
}

// Closes any open modal when the Escape key is pressed.
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        document.querySelectorAll('.modal').forEach(modal => {
            if (!modal.classList.contains('pointer-events-none')) {
                closeModal(modal.id);
            }
        });
    }
});

// Runs script after the page content has fully loaded.
document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    const closeMenu = () => {
        if (mobileMenu && mobileMenu.classList.contains('menu-open')) {
            mobileMenu.classList.remove('menu-open');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300); // Match CSS transition duration
        }
    };

    if(mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
                setTimeout(() => { // Allow display change to apply before transform
                    mobileMenu.classList.add('menu-open');
                }, 10);
            } else {
                closeMenu();
            }
        });
    }

    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Set default chart text color for dark theme
    Chart.defaults.color = '#94a3b8'; // slate-400

    // Hide all modals on initial page load.
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });

    // Add click listeners to project cards to open their modals.
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal-id');
            if (modalId) {
                openModal(modalId);
            }
        });
    });

    // Data for the Galaxy Distribution Chart.
    const galaxyData = {
        labels: ['Disturbed', 'Merging', 'Round Smooth', 'In-between Smooth', 'Cigar Shaped Smooth', 'Barred Spiral', 'Unbarred Tight Spiral', 'Unbarred Loose Spiral', 'Edge-on without Bulge', 'Edge-on with Bulge'],
        counts: [601, 338, 2872, 2315, 335, 2736, 2758, 2697, 219, 2865]
    };
    
    // Data for the Tree Species Recognition experiments.
    const treeExperimentData = [
        { name: "Baseline Model", description: "The initial model shows a significant disparity. It achieves high precision on majority classes but very low recall for under-represented species, meaning it often fails to identify them.", precision: 0.38, recall: 0.28, architecture: [{ type: 'Input', detail: '60x60x3' }, { type: 'Conv2D', detail: '32 filters' }, { type: 'MaxPooling2D', detail: '' }, { type: 'Flatten', detail: '' }, { type: 'Dense', detail: '64 units' }, { type: 'Dense', detail: '20 units (Softmax)' }] },
        { name: "Reduced Granularity", description: "By grouping 20 species into 10 broader classes, the model's task becomes simpler. This improves both precision and recall, but loses fine-grained classification detail.", precision: 0.65, recall: 0.61, architecture: [{ type: 'Input', detail: '60x60x3' }, { type: 'Conv2D', detail: '32 filters' }, { type: 'MaxPooling2D', detail: '' }, { type: 'Flatten', detail: '' }, { type: 'Dense', detail: '64 units' }, { type: 'Dense', detail: '10 units (Softmax)' }] },
        { name: "Added Augmentation", description: "Introducing random translations during training helps the model generalize better from the limited data. This provides a moderate boost to both precision and recall.", precision: 0.45, recall: 0.35, architecture: [{ type: 'Input', detail: '60x60x3' }, { type: 'Data Augmentation', detail: 'Random Translations' }, { type: 'Conv2D', detail: '32 filters' }, { type: 'MaxPooling2D', detail: '' }, { type: 'Flatten', detail: '' }, { type: 'Dense', detail: '64 units' }, { type: 'Dense', 'detail': '20 units (Softmax)' }] },
        { name: "Class Weighting", description: "This technique forces the model to pay more attention to rare classes. It dramatically improves recall for minority classes but harms overall precision, showing a critical trade-off.", precision: 0.16, recall: 0.51, architecture: [{ type: 'Input', detail: '60x60x3' }, { type: 'Conv2D', detail: '32 filters (Class Weights Applied)' }, { type: 'MaxPooling2D', detail: '' }, { type: 'Flatten', detail: '' }, { type: 'Dense', detail: '64 units' }, { type: 'Dense', 'detail': '20 units (Softmax)' }] },
        { name: "Deeper Model", description: "Increasing model complexity by adding more layers allows it to learn more intricate features. This results in a significant improvement in both precision and recall over the baseline.", precision: 0.59, recall: 0.52, architecture: [{ type: 'Input', detail: '60x60x3' }, { type: 'Conv2D', detail: '32 filters' }, { type: 'Conv2D', detail: '64 filters' }, { type: 'MaxPooling2D', detail: '' }, { type: 'Flatten', detail: '' }, { type: 'Dense', detail: '128 units' }, { type: 'Dense', 'detail': '20 units (Softmax)' }] }
    ];

    // Data for the Confusion Matrix.
    const confusionMatrixData = {
        labels: ['Disturbed', 'Merging', 'Round Smooth', 'In-between', 'Cigar Shaped', 'Barred Spiral', 'Unbarred Tight', 'Unbarred Loose', 'Edge-on (no bulge)', 'Edge-on (w/ bulge)'],
        values: [
            [100, 20, 5, 10, 2, 8, 3, 4, 1, 0], [15, 95, 2, 5, 1, 12, 5, 6, 0, 1], [4, 1, 450, 50, 10, 2, 1, 0, 0, 3], [8, 4, 60, 400, 25, 15, 20, 22, 1, 2], [1, 0, 12, 30, 65, 3, 1, 1, 4, 2], [5, 8, 3, 18, 2, 480, 55, 30, 0, 1], [2, 3, 1, 22, 1, 60, 470, 45, 0, 0], [3, 4, 0, 25, 1, 35, 50, 450, 0, 1], [0, 0, 1, 2, 5, 1, 0, 0, 90, 10], [0, 1, 2, 3, 3, 2, 1, 1, 12, 480]
        ]
    };
    
    /**
     * Wraps long text labels for charts.
     * @param {string} text - The text to wrap.
     * @param {number} maxChars - The max characters per line.
     * @returns {string[]} An array of strings, each being a line.
     */
    function wrapText(text, maxChars) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';
        words.forEach(word => {
            if ((currentLine + ' ' + word).length > maxChars && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = currentLine ? currentLine + ' ' + word : word;
            }
        });
        lines.push(currentLine);
        return lines;
    }

    // Creates the Galaxy Distribution Chart.
    const ctxGalaxy = document.getElementById('galaxyDistChart');
    if (ctxGalaxy) {
        new Chart(ctxGalaxy, {
            type: 'bar',
            data: { 
                labels: galaxyData.labels.map(l => wrapText(l, 15)),
                datasets: [{ 
                    label: 'Number of Images', 
                    data: galaxyData.counts, 
                    backgroundColor: 'rgba(248, 113, 113, 0.5)',
                    borderColor: '#f87171',
                    borderWidth: 1 
                }] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                indexAxis: 'y', // Makes it a horizontal bar chart.
                plugins: { legend: { display: false } },
                scales: { 
                    x: { 
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        title: { display: true, text: 'Image Count' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    }
                }
            }
        });
    }

    // Creates and displays the Confusion Matrix table.
    const matrixContainer = document.getElementById('confusionMatrix');
    if(matrixContainer){
        let tableHTML = '<table class="w-full border-collapse">';
        tableHTML += '<thead><tr><th class="p-1 border border-slate-600 bg-slate-700">Actual ↓</th>';
        // Add rotated column headers.
        confusionMatrixData.labels.forEach(l => { 
            tableHTML += `<th class="p-1 border border-slate-600 bg-slate-700 align-bottom" style="writing-mode: vertical-rl; transform: rotate(180deg);">${l}</th>` 
        });
        tableHTML += '</tr></thead><tbody>';
        // Populate table rows and cells.
        confusionMatrixData.values.forEach((row, i) => {
            tableHTML += `<tr><th class="p-1 border border-slate-600 bg-slate-700 text-left">${confusionMatrixData.labels[i]}</th>`;
            row.forEach((val, j) => {
                const isDiagonal = i === j; // Correct predictions are on the diagonal.
                const bgColor = isDiagonal ? `rgba(248, 113, 113, ${val / 500})` : `rgba(251, 146, 60, ${val / 100})`;
                const textColor = (isDiagonal && val > 200) || (!isDiagonal && val > 50) ? 'text-slate-900' : 'text-slate-100';
                tableHTML += `<td class="p-1 border border-slate-600 text-center font-medium ${textColor}" style="background-color: ${bgColor}" title="Predicted: ${confusionMatrixData.labels[j]}, Actual: ${confusionMatrixData.labels[i]}">${val}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';
        matrixContainer.innerHTML = tableHTML;
    }

    // Creates the Tree Performance Chart.
    let treeChart;
    const ctxTree = document.getElementById('treePerfChart');
    if (ctxTree) {
        treeChart = new Chart(ctxTree, {
            type: 'bar',
            data: { 
                labels: ['Performance'],
                datasets: [
                    { label: 'Precision', data: [0], backgroundColor: '#f87171' },
                    { label: 'Recall', data: [0], backgroundColor: '#fb923c' }
                ] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        max: 1.0,
                        title: { display: true, text: 'Score' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    // Get elements for updating the Tree Experiment modal.
    const expButtons = document.getElementById('exp-buttons');
    const expTitle = document.getElementById('exp-title');
    const expDesc = document.getElementById('exp-desc');
    const modelViz = document.getElementById('model-viz');

    /**
     * Updates the Tree Experiment modal based on the selected experiment.
     * @param {number} expIndex - The index of the experiment to display.
     */
    function updateTreeExperiment(expIndex) {
        const data = treeExperimentData[expIndex];
        // Update chart.
        if (treeChart) { 
            treeChart.data.datasets[0].data = [data.precision];
            treeChart.data.datasets[1].data = [data.recall];
            treeChart.update();
        }
        // Update text content.
        if(expTitle) expTitle.textContent = data.name;
        if(expDesc) expDesc.textContent = data.description;
        
        // Update model architecture diagram.
        if(modelViz){
            let archHTML = '';
            data.architecture.forEach((layer, index) => {
                archHTML += `<div class="bg-slate-700 p-2 rounded text-center text-slate-300">${layer.type} <span class="text-slate-400">${layer.detail}</span></div>`;
                if(index < data.architecture.length -1) { archHTML += `<div class="text-center text-slate-500">↓</div>`; }
            });
            modelViz.innerHTML = archHTML;
        }
        // Update active button style.
        document.querySelectorAll('.btn-exp').forEach(btn => { btn.classList.remove('active-btn'); });
        document.querySelector(`.btn-exp[data-exp='${expIndex}']`).classList.add('active-btn');
    }
    
    // Add click listener for experiment buttons.
    if(expButtons) {
        expButtons.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const expIndex = e.target.getAttribute('data-exp');
                updateTreeExperiment(expIndex);
            }
        });
        updateTreeExperiment(0); // Show the first experiment by default.
    }
});

/**
 * Renders the Sales Analysis chart.
 */
function renderSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    const monthlySalesData = {
        labels: ['Sep 23', 'Oct 23', 'Nov 23', 'Dec 23', 'Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24', 'Jul 24', 'Aug 24', 'Sep 24'],
        data: [481961.79, 2318466.35, 2068434.14, 1980700.33, 6619498.15, 5733696.06, 6324367.84, 6418253.62, 6709042.93, 6668633.59, 6535129.52, 6706118.61, 5037691.12]
    };
    const productRevenueData = {
        labels: ['Smartphone', 'Smartwatch', 'Laptop', 'Tablet', 'Headphones'],
        data: [21516754.69, 14036273.06, 12295565.65, 11712000.41, 4041400.24]
    };

    /**
     * Formats numbers into a short format (e.g., 1.2M, 500K).
     * @param {number} num - The number to format.
     * @returns {string} The formatted string.
     */
    const humanFormat = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    };

    salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlySalesData.labels,
            datasets: [{
                label: 'Monthly Revenue',
                data: monthlySalesData.data,
                backgroundColor: 'rgba(248, 113, 113, 0.8)',
                yAxisID: 'y',
            }, {
                label: 'Total Product Revenue',
                type: 'line',
                data: productRevenueData.data,
                yAxisID: 'y2',
                borderColor: '#facc15',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { 
                tooltip: { // Custom tooltip formatting.
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            // Format value as currency.
                            if (context.parsed.y !== null) { label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y); }
                            return label;
                        }
                    }
                },
                legend: { position: 'top' }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: { // Primary Y-axis (left).
                    type: 'linear', 
                    position: 'left', 
                    title: { display: true, text: 'Monthly Revenue' }, 
                    ticks: { callback: humanFormat },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y2: { // Secondary Y-axis (right).
                    type: 'linear', 
                    position: 'right', 
                    title: { display: true, text: 'Total Product Revenue' }, 
                    grid: { drawOnChartArea: false },
                    ticks: { callback: humanFormat }
                }
            }
        }
    });
}
