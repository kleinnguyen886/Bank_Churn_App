function showNotice(message) {
	window.alert(message);
}

function getCustomerMeta() {
	const summary = document.getElementById('customerSummary');
	if (!summary) {
		return null;
	}

	return {
		id: summary.dataset.customerId || '',
		name: summary.dataset.customerName || 'Customer',
		email: summary.dataset.customerEmail || '',
		phone: summary.dataset.customerPhone || '',
		risk: summary.dataset.customerRisk || 'Medium',
		status: summary.dataset.customerStatus || 'new',
	};
}

function normalizeCommunicationStatus(value) {
	const text = String(value || '').trim().toLowerCase().replace(/[_\s]+/g, '-');
	if (text === 'ongoing') {
		return 'on-going';
	}
	if (text === 'on-going' || text === 'new' || text === 'failed') {
		return text;
	}
	return 'new';
}

function formatCommunicationStatusLabel(value) {
	const normalized = normalizeCommunicationStatus(value);
	if (normalized === 'on-going') {
		return 'On-going';
	}
	if (normalized === 'failed') {
		return 'Failed';
	}
	return 'New';
}

function applyCustomerStatusControlStyle(status) {
	const statusSelect = document.getElementById('customerStatusBtn');
	if (!(statusSelect instanceof HTMLSelectElement)) {
		return;
	}

	const normalized = normalizeCommunicationStatus(status);
	statusSelect.classList.remove('status-new', 'status-on-going', 'status-failed');
	statusSelect.classList.add(`status-${normalized}`);
}

function applyCustomerStatusBadge(status) {
	const badges = Array.from(document.querySelectorAll('.customer-status-badge'));
	const fallbackBadge = document.querySelector('#customerSummary .status-badge');
	const summary = document.getElementById('customerSummary');
	const normalized = normalizeCommunicationStatus(status);
	if (badges.length > 0) {
		badges.forEach((badge) => {
			badge.className = `status-badge status-${normalized} customer-status-badge`;
			badge.textContent = formatCommunicationStatusLabel(normalized);
		});
	} else if (fallbackBadge) {
		fallbackBadge.className = `status-badge status-${normalized}`;
		fallbackBadge.textContent = formatCommunicationStatusLabel(normalized);
	}
	if (summary) {
		summary.dataset.customerStatus = normalized;
	}
	applyCustomerStatusControlStyle(normalized);
	return normalized;
}

function callCustomer(meta) {
	if (!meta || !meta.phone) {
		showNotice('Customer phone is not available.');
		return;
	}
	window.location.href = `tel:${meta.phone}`;
}

function emailCustomer(meta) {
	if (!meta || !meta.email) {
		showNotice('Customer email is not available.');
		return;
	}
	const subject = encodeURIComponent(`Retention follow-up for ${meta.name}`);
	const body = encodeURIComponent('Hello,\n\nWe are reaching out to support your account experience.');
	window.location.href = `mailto:${meta.email}?subject=${subject}&body=${body}`;
}
async function updateCustomerStatus(nextStatusInput) {
	const meta = getCustomerMeta();
	if (!meta || !meta.id) {
		showNotice('Customer details not found.');
		return false;
	}

	const nextStatus = normalizeCommunicationStatus(nextStatusInput);
	if (!['new', 'on-going', 'failed'].includes(nextStatus)) {
		showNotice('Please select a valid communication status.');
		return false;
	}

	try {
		const response = await fetch('/api/workspace/update-status', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				customer_id: meta.id,
				status: nextStatus,
			}),
		});
		const payload = await response.json().catch(() => ({}));
		if (!response.ok) {
			throw new Error(payload.error || `Status update failed: ${response.status}`);
		}

		const appliedStatus = normalizeCommunicationStatus(payload.status || nextStatus);
		applyCustomerStatusBadge(appliedStatus);

		const statusSelect = document.getElementById('customerStatusBtn');
		if (statusSelect instanceof HTMLSelectElement) {
			statusSelect.value = appliedStatus;
			applyCustomerStatusControlStyle(appliedStatus);
		}

		showNotice(payload.message || `Communication status updated to ${formatCommunicationStatusLabel(appliedStatus)}.`);
		return true;
	} catch (error) {
		console.error('Failed to update communication status', error);
		showNotice(error.message || 'Unable to update communication status.');
		return false;
	}
}

document.addEventListener('DOMContentLoaded', function () {
	let meta = getCustomerMeta();

	const callBtn = document.getElementById('customerCallBtn');
	if (callBtn) {
		callBtn.addEventListener('click', function () {
			callCustomer(meta);
		});
	}

	const emailBtn = document.getElementById('customerEmailBtn');
	if (emailBtn) {
		emailBtn.addEventListener('click', function () {
			emailCustomer(meta);
		});
	}

	applyCustomerStatusBadge(meta ? meta.status : 'new');

	const statusSelect = document.getElementById('customerStatusBtn');
	if (statusSelect instanceof HTMLSelectElement) {
		const initialStatus = normalizeCommunicationStatus(meta ? meta.status : statusSelect.value || 'new');
		statusSelect.value = initialStatus;
		applyCustomerStatusControlStyle(initialStatus);

		statusSelect.addEventListener('change', async function () {
			const previousStatus = normalizeCommunicationStatus(meta ? meta.status : initialStatus);
			const selectedStatus = normalizeCommunicationStatus(statusSelect.value);
			if (selectedStatus === previousStatus) {
				return;
			}

			applyCustomerStatusControlStyle(selectedStatus);

			const updated = await updateCustomerStatus(selectedStatus);
			if (updated) {
				meta = getCustomerMeta();
			} else {
				statusSelect.value = previousStatus;
				applyCustomerStatusControlStyle(previousStatus);
			}
		});
	}
});
