async function loadGovernanceCharts() {
	const response = await fetch('/api/charts/governance');
	const payload = await response.json();

	const chartEl = document.getElementById('governanceTrendChart');
	if (!chartEl || !payload.performance_trend) {
		return;
	}

	new Chart(chartEl, {
		type: 'line',
		data: {
			labels: payload.performance_trend.labels,
			datasets: [
				{
					label: 'Accuracy',
					data: payload.performance_trend.series.accuracy,
					borderColor: '#3b82f6',
					backgroundColor: '#3b82f6',
					tension: 0.35,
				},
				{
					label: 'Precision',
					data: payload.performance_trend.series.precision,
					borderColor: '#10b981',
					backgroundColor: '#10b981',
					tension: 0.35,
				},
				{
					label: 'Recall',
					data: payload.performance_trend.series.recall,
					borderColor: '#f59e0b',
					backgroundColor: '#f59e0b',
					tension: 0.35,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
		},
	});
}

loadGovernanceCharts().catch((error) => {
	console.error('Failed to load governance charts', error);
});
