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
	};
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

function updateCustomerStatus() {
	const riskBadge = document.querySelector('.risk-badge');
	if (!riskBadge) {
		showNotice('Customer risk badge not found.');
		return;
	}

	const current = (riskBadge.textContent || 'Medium').trim().toLowerCase();
	const nextMap = {
		high: 'Medium',
		medium: 'Low',
		low: 'High',
	};
	const next = nextMap[current] || 'Medium';
	riskBadge.textContent = next;
	riskBadge.className = `risk-badge risk-${next.toLowerCase()}`;
	showNotice(`Customer status updated. New risk level: ${next}.`);
}

document.addEventListener('DOMContentLoaded', function () {
	const meta = getCustomerMeta();

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

	const statusBtn = document.getElementById('customerStatusBtn');
	if (statusBtn) {
		statusBtn.addEventListener('click', updateCustomerStatus);
	}
});
