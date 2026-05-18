let campaignTrendChart = null;
let campaignGeoChart = null;
let campaignPayload = null;

function asArray(value) {
	return Array.isArray(value) ? value : [];
}

function showNotice(message) {
	window.alert(message);
}

async function loadCampaignCharts() {
	const response = await fetch('/api/charts/campaigns');
	if (!response.ok) {
		throw new Error(`Campaign charts request failed: ${response.status}`);
	}
	const payload = await response.json();
	campaignPayload = payload;

	const trendEl = document.getElementById('campaignTrendChart');
	if (trendEl && payload.trend) {
		if (campaignTrendChart) {
			campaignTrendChart.destroy();
		}
		campaignTrendChart = new Chart(trendEl, {
			type: 'line',
			data: {
				labels: asArray(payload.trend.labels),
				datasets: [
					{
						label: 'Churns Prevented',
						data: asArray(payload.trend.prevented),
						borderColor: '#10b981',
						backgroundColor: '#10b981',
						tension: 0.35,
					},
					{
						label: 'Budget (K)',
						data: asArray(payload.trend.budget),
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
		if (campaignGeoChart) {
			campaignGeoChart.destroy();
		}
		const geoValues = asArray(payload.geo_acceptance.values);
		campaignGeoChart = new Chart(geoEl, {
			type: 'bar',
			data: {
				labels: asArray(payload.geo_acceptance.labels),
				datasets: [
					{
						label: 'Acceptance %',
						data: geoValues,
						backgroundColor: geoValues.map((_, idx) => ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][idx % 5]),
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

function exportCampaignTable() {
	const table = document.querySelector('table.data-table');
	if (!table) {
		showNotice('No campaign table found to export.');
		return;
	}
	const rows = Array.from(table.querySelectorAll('tr')).map((tr) =>
		Array.from(tr.querySelectorAll('th,td')).map((cell) => `"${(cell.textContent || '').trim().replace(/"/g, '""')}"`).join(',')
	);
	const csv = rows.join('\n');
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'campaigns_table.csv';
	a.click();
	URL.revokeObjectURL(url);
}

function createCampaignAction() {
	const sectionTitle = document.querySelector('section.panel h2');
	if (sectionTitle) {
		sectionTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}
	showNotice('Campaign creation flow is initialized. Fill campaign details in your pipeline or data source.');
}

document.addEventListener('DOMContentLoaded', function () {
	const exportBtn = document.getElementById('campaignExportBtn');
	if (exportBtn) {
		exportBtn.addEventListener('click', exportCampaignTable);
	}

	const createBtn = document.getElementById('campaignCreateBtn');
	if (createBtn) {
		createBtn.addEventListener('click', createCampaignAction);
	}

	if (typeof Chart === 'undefined') {
		showNotice('Chart.js is not available. Campaign charts cannot render.');
		return;
	}

	loadCampaignCharts().catch((error) => {
		console.error('Failed to load campaign charts', error);
		showNotice('Campaign charts could not be loaded.');
	});
});
