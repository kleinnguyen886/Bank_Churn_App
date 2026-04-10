async function loadDashboardCharts() {
	const response = await fetch('/api/charts/dashboard');
	const payload = await response.json();

	const trendCtx = document.getElementById('dashboardTrendChart');
	if (trendCtx && payload.churn_trend) {
		new Chart(trendCtx, {
			type: 'line',
			data: {
				labels: payload.churn_trend.labels,
				datasets: payload.churn_trend.datasets.map((ds) => ({
					label: ds.label,
					data: ds.data,
					borderColor: ds.borderColor,
					backgroundColor: ds.borderColor,
					tension: 0.35,
				})),
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
			},
		});
	}

	const geoCtx = document.getElementById('dashboardGeoChart');
	if (geoCtx && payload.geography) {
		new Chart(geoCtx, {
			type: 'doughnut',
			data: {
				labels: payload.geography.labels,
				datasets: [
					{
						data: payload.geography.values,
						backgroundColor: payload.geography.colors,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
			},
		});
	}
}

loadDashboardCharts().catch((error) => {
	console.error('Failed to load dashboard charts', error);
});
