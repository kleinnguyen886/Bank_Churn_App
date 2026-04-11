let dashboardTrendChart = null;
let dashboardGeoChart = null;
let dashboardPayload = null;
let showLast30 = false;
let showAllGeographies = true;

function asArray(value) {
	return Array.isArray(value) ? value : [];
}

function showNotice(message) {
	window.alert(message);
}

async function getDashboardPayload() {
	const response = await fetch('/api/charts/dashboard');
	if (!response.ok) {
		throw new Error(`Dashboard charts request failed: ${response.status}`);
	}
	return response.json();
}

function buildTrendData(payload) {
	const trend = payload && payload.churn_trend ? payload.churn_trend : {};
	let labels = asArray(trend.labels);
	let datasets = asArray(trend.datasets).map((ds) => ({
		label: ds.label || 'Series',
		data: asArray(ds.data),
		borderColor: ds.borderColor || '#3b82f6',
		backgroundColor: ds.borderColor || '#3b82f6',
		tension: 0.35,
	}));

	if (showLast30 && labels.length > 30) {
		labels = labels.slice(-30);
		datasets = datasets.map((ds) => ({ ...ds, data: ds.data.slice(-30) }));
	}

	return { labels, datasets };
}

function buildGeoData(payload) {
	const geo = payload && payload.geography ? payload.geography : {};
	let labels = asArray(geo.labels);
	let values = asArray(geo.values);
	let colors = asArray(geo.colors);

	if (!showAllGeographies && labels.length > 3) {
		labels = labels.slice(0, 3);
		values = values.slice(0, 3);
		colors = colors.slice(0, 3);
	}

	if (colors.length < values.length) {
		colors = labels.map((_, idx) => ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][idx % 5]);
	}

	return { labels, values, colors };
}

function renderDashboardCharts(payload) {
	const trendCtx = document.getElementById('dashboardTrendChart');
	const geoCtx = document.getElementById('dashboardGeoChart');

	const trendData = buildTrendData(payload);
	const geoData = buildGeoData(payload);

	if (trendCtx) {
		if (dashboardTrendChart) {
			dashboardTrendChart.destroy();
		}
		dashboardTrendChart = new Chart(trendCtx, {
			type: 'line',
			data: {
				labels: trendData.labels,
				datasets: trendData.datasets,
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
			},
		});
	}

	if (geoCtx) {
		if (dashboardGeoChart) {
			dashboardGeoChart.destroy();
		}
		dashboardGeoChart = new Chart(geoCtx, {
			type: 'doughnut',
			data: {
				labels: geoData.labels,
				datasets: [
					{
						data: geoData.values,
						backgroundColor: geoData.colors,
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

function exportTopSegments() {
	const table = document.querySelector('table.data-table.compact');
	if (!table) {
		showNotice('No dashboard table found to export.');
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
	a.download = 'dashboard_top_segments.csv';
	a.click();
	URL.revokeObjectURL(url);
}

function wireDashboardButtons() {
	const last30Btn = document.getElementById('dashboardLast30Btn');
	const geoToggleBtn = document.getElementById('dashboardGeoToggleBtn');
	const exportBtn = document.getElementById('dashboardExportBtn');

	if (last30Btn) {
		last30Btn.addEventListener('click', function () {
			showLast30 = !showLast30;
			last30Btn.textContent = showLast30 ? 'Full Range' : 'Last 30 Days';
			if (dashboardPayload) {
				renderDashboardCharts(dashboardPayload);
			}
		});
	}

	if (geoToggleBtn) {
		geoToggleBtn.addEventListener('click', function () {
			showAllGeographies = !showAllGeographies;
			geoToggleBtn.textContent = showAllGeographies ? 'Top 3 Geographies' : 'All Geographies';
			if (dashboardPayload) {
				renderDashboardCharts(dashboardPayload);
			}
		});
	}

	if (exportBtn) {
		exportBtn.addEventListener('click', exportTopSegments);
	}
}

document.addEventListener('DOMContentLoaded', function () {
	if (typeof Chart === 'undefined') {
		showNotice('Chart.js is not available. Dashboard charts cannot render.');
		return;
	}

	wireDashboardButtons();
	getDashboardPayload()
		.then((payload) => {
			dashboardPayload = payload;
			renderDashboardCharts(payload);
		})
		.catch((error) => {
			console.error('Failed to load dashboard charts', error);
			showNotice('Dashboard charts could not be loaded. Please refresh.');
		});
});
