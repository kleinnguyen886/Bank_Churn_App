async function loadCampaignCharts() {
	const response = await fetch('/api/charts/campaigns');
	const payload = await response.json();

	const trendEl = document.getElementById('campaignTrendChart');
	if (trendEl && payload.trend) {
		new Chart(trendEl, {
			type: 'line',
			data: {
				labels: payload.trend.labels,
				datasets: [
					{
						label: 'Churns Prevented',
						data: payload.trend.prevented,
						borderColor: '#10b981',
						backgroundColor: '#10b981',
						tension: 0.35,
					},
					{
						label: 'Budget (K)',
						data: payload.trend.budget,
						borderColor: '#3b82f6',
						backgroundColor: '#3b82f6',
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

	const geoEl = document.getElementById('campaignGeoChart');
	if (geoEl && payload.geo_acceptance) {
		new Chart(geoEl, {
			type: 'bar',
			data: {
				labels: payload.geo_acceptance.labels,
				datasets: [
					{
						label: 'Acceptance %',
						data: payload.geo_acceptance.values,
						backgroundColor: ['#3b82f6', '#ef4444', '#10b981'],
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

loadCampaignCharts().catch((error) => {
	console.error('Failed to load campaign charts', error);
});
