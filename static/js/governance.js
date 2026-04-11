let governanceTrendChart = null;
let governancePayload = null;
let retrainingPollTimer = null;
let activeRetrainingJobId = null;

function asArray(value) {
	return Array.isArray(value) ? value : [];
}

function showNotice(message) {
	window.alert(message);
}

function setRetrainingStatus(message) {
	const statusEl = document.getElementById('governanceRetrainStatus');
	if (statusEl) {
		statusEl.textContent = message;
	}
}

function setRetrainingButtonState(isBusy, label) {
	const button = document.getElementById('governanceRetrainBtn');
	if (!button) {
		return;
	}
	if (!button.dataset.originalLabel) {
		button.dataset.originalLabel = button.textContent || 'Trigger Retraining';
	}
	button.disabled = isBusy;
	button.textContent = isBusy ? label : button.dataset.originalLabel;
}

function stopRetrainingPolling() {
	if (retrainingPollTimer) {
		clearInterval(retrainingPollTimer);
		retrainingPollTimer = null;
	}
	activeRetrainingJobId = null;
}

function formatRetrainingStatus(job) {
	if (!job) {
		return 'Retraining is idle.';
	}

	const parts = [];
	if (job.status === 'queued') {
		parts.push('Retraining job queued.');
	} else if (job.status === 'running') {
		parts.push('Retraining is running.');
	} else if (job.status === 'completed') {
		parts.push('Retraining completed successfully.');
	} else if (job.status === 'failed') {
		parts.push('Retraining failed.');
	} else {
		parts.push('Retraining status updated.');
	}

	if (job.message) {
		parts.push(job.message);
	}

	if (job.progress !== undefined && job.progress !== null) {
		parts.push(`${job.progress}% complete.`);
	}

	if (job.status === 'completed' && job.finished_at) {
		parts.push(`Finished at ${job.finished_at}.`);
	}

	if (job.status === 'failed' && job.error) {
		parts.push(`Error: ${job.error}.`);
	}

	return parts.join(' ');
}

function updateRetrainingStatus(job) {
	setRetrainingStatus(formatRetrainingStatus(job));
}

async function fetchRetrainingJob(jobId) {
	const response = await fetch(`/api/retraining/jobs/${encodeURIComponent(jobId)}`);
	if (!response.ok) {
		throw new Error(`Retraining status request failed: ${response.status}`);
	}
	const payload = await response.json();
	return payload.job || payload;
}

function beginRetrainingPolling(jobId) {
	stopRetrainingPolling();
	activeRetrainingJobId = jobId;
	setRetrainingButtonState(true, 'Retraining...');
	retrainingPollTimer = window.setInterval(() => {
		if (!activeRetrainingJobId) {
			stopRetrainingPolling();
			return;
		}
		fetchRetrainingJob(activeRetrainingJobId)
			.then((job) => {
				updateRetrainingStatus(job);
				if (job.status === 'completed' || job.status === 'failed') {
					stopRetrainingPolling();
					setRetrainingButtonState(false);
				}
			})
			.catch((error) => {
				console.error('Polling retraining job failed', error);
			});
	}, 2000);

	fetchRetrainingJob(jobId)
		.then((job) => {
			updateRetrainingStatus(job);
			if (job.status === 'completed' || job.status === 'failed') {
				stopRetrainingPolling();
				setRetrainingButtonState(false);
			}
		})
		.catch((error) => {
			console.error('Polling retraining job failed', error);
		});
}

async function resumeRetrainingJob() {
	try {
		const response = await fetch('/api/retraining/jobs/current');
		if (!response.ok) {
			return;
		}
		const payload = await response.json();
		const job = payload.job;
		if (!job) {
			setRetrainingStatus('Retraining is idle.');
			setRetrainingButtonState(false);
			return;
		}

		updateRetrainingStatus(job);
		if (job.status === 'queued' || job.status === 'running') {
			beginRetrainingPolling(job.job_id);
			return;
		}

		setRetrainingButtonState(false);
	} catch (error) {
		console.error('Failed to load retraining status', error);
	}
}

async function loadGovernanceCharts() {
	const response = await fetch('/api/charts/governance');
	if (!response.ok) {
		throw new Error(`Governance charts request failed: ${response.status}`);
	}
	const payload = await response.json();
	governancePayload = payload;

	const chartEl = document.getElementById('governanceTrendChart');
	if (!chartEl || !payload.performance_trend) {
		return;
	}

	const labels = asArray(payload.performance_trend.labels);
	const series = payload.performance_trend.series || {};

	if (governanceTrendChart) {
		governanceTrendChart.destroy();
	}

	governanceTrendChart = new Chart(chartEl, {
		type: 'line',
		data: {
			labels,
			datasets: [
				{
					label: 'Accuracy',
					data: asArray(series.accuracy),
					borderColor: '#3b82f6',
					backgroundColor: '#3b82f6',
					tension: 0.35,
				},
				{
					label: 'Precision',
					data: asArray(series.precision),
					borderColor: '#10b981',
					backgroundColor: '#10b981',
					tension: 0.35,
				},
				{
					label: 'Recall',
					data: asArray(series.recall),
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

function exportGovernanceJson() {
	if (!governancePayload) {
		showNotice('No governance payload available yet.');
		return;
	}
	const blob = new Blob([JSON.stringify(governancePayload, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'governance_trend.json';
	a.click();
	URL.revokeObjectURL(url);
}

async function triggerRetraining() {
	const button = document.getElementById('governanceRetrainBtn');
	if (button) {
		button.disabled = true;
		button.textContent = 'Starting...';
	}
	setRetrainingStatus('Submitting retraining job.');

	try {
		const response = await fetch('/api/retraining/jobs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(`Retraining request failed: ${response.status}`);
		}
		const payload = await response.json();
		const job = payload.job || payload;
		updateRetrainingStatus(job);
		if (job.status === 'queued' || job.status === 'running') {
			beginRetrainingPolling(job.job_id);
			return;
		}
		setRetrainingButtonState(false);
		showNotice(payload.message || 'Retraining request accepted.');
	} catch (error) {
		console.error('Failed to trigger retraining', error);
		setRetrainingButtonState(false);
		setRetrainingStatus('Retraining request failed.');
		showNotice('Retraining trigger failed. Please check backend state.');
	}
}

document.addEventListener('DOMContentLoaded', function () {
	const exportBtn = document.getElementById('governanceExportBtn');
	if (exportBtn) {
		exportBtn.addEventListener('click', exportGovernanceJson);
	}

	const retrainBtn = document.getElementById('governanceRetrainBtn');
	if (retrainBtn) {
		retrainBtn.addEventListener('click', triggerRetraining);
	}

	setRetrainingStatus('Retraining is idle.');
	resumeRetrainingJob();

	if (typeof Chart === 'undefined') {
		showNotice('Chart.js is not available. Governance chart cannot render.');
		return;
	}

	loadGovernanceCharts().catch((error) => {
		console.error('Failed to load governance charts', error);
		showNotice('Governance trend chart could not be loaded.');
	});
});
