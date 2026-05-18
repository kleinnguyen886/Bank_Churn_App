async function loadWorkspacePage(page, pageSize) {
	const table = document.getElementById('workspaceTable');
	const pagination = document.getElementById('workspacePagination');
	if (!table || !pagination) {
		return;
	}

	const filterForm = document.getElementById('workspaceFiltersForm');
	const params = new URLSearchParams();
	if (filterForm) {
		const formData = new FormData(filterForm);
		for (const [key, value] of formData.entries()) {
			if (key === 'page' || key === 'page_size') {
				continue;
			}
			const textValue = String(value || '').trim();
			if (textValue) {
				params.set(key, textValue);
			}
		}
	}
	params.set('page', String(page));
	params.set('page_size', String(pageSize));

	const response = await fetch(`/api/workspace?${params.toString()}`);
	if (!response.ok) {
		throw new Error(`Workspace request failed: ${response.status}`);
	}
	const payload = await response.json();

	const tbody = table.querySelector('tbody');
	tbody.innerHTML = '';
	const dataReady = payload.data_ready !== false;
	const hasRows = Array.isArray(payload.rows) && payload.rows.length > 0;

	if (!dataReady || !hasRows) {
		renderWorkspaceEmptyRow(tbody, payload.empty_message || 'No rows to display.');
	} else {
		payload.rows.forEach((row) => {
			const customerId = String(row.customer_id || '');
			const customerName = String(row.name || 'Unknown');
			const geography = String(row.geography || 'Unknown');
			const geoTag = geography.slice(0, 2).toUpperCase() || '--';
			const city = String(row.city || '');
			const region = String(row.region || '');
			const locationText = [city, region].filter(Boolean).join(', ') || '-';
			const ageGroup = String(row.customer_age_group || '').trim();
			const safeRisk = String(row.risk || 'Low');
			const riskClass = `risk-${safeRisk.toLowerCase()}`;
			const scoreValue = Number(row.score || 0);
			const scoreRaw = Number.isFinite(scoreValue) ? scoreValue.toFixed(3) : '0.000';
			const scorePercent = Number.isFinite(scoreValue)
				? Math.max(0, Math.min(100, Math.round(scoreValue * 100)))
				: 0;
			const hasPhone = Boolean(String(row.synthetic_phone || '').trim());

			const tr = document.createElement('tr');
			tr.dataset.customerId = customerId;
			tr.innerHTML = `
				<td>
					<a href="/customer/${encodeURIComponent(customerId)}">${escapeHtml(customerName)}</a>
					<div class="workspace-customer-id muted small">${escapeHtml(customerId)}</div>
					${ageGroup ? `<div class="workspace-customer-meta muted small">Age group: ${escapeHtml(ageGroup)}</div>` : ''}
				</td>
				<td>
					<div class="workspace-location-primary">
						<span class="workspace-geo-pill">${escapeHtml(geoTag)}</span>
						<span>${escapeHtml(geography)}</span>
					</div>
					<div class="workspace-location-secondary muted small">${escapeHtml(locationText)}</div>
				</td>
				<td>
					<div class="workspace-risk-score">${escapeHtml(String(scorePercent))}%</div>
					<span class="risk-badge ${escapeHtml(riskClass)}">${escapeHtml(safeRisk)}</span>
				</td>
				<td>${escapeHtml(String(row.owner || 'Unassigned'))}</td>
				<td>${renderCommunicationStatusBadge(row.status || 'new')}</td>
				<td>
					<div class="workspace-actions">
						<a
							class="workspace-action-icon workspace-action-view"
							href="/customer/${encodeURIComponent(customerId)}"
							title="View details"
							aria-label="View details"
						><i data-lucide="eye" class="icon"></i></a>
						${hasPhone
							? `<a class="workspace-action-icon workspace-action-call" href="tel:${escapeHtml(String(row.synthetic_phone))}" title="Call" aria-label="Call"><i data-lucide="phone" class="icon"></i></a>`
							: '<span class="workspace-action-icon workspace-action-disabled" aria-disabled="true" title="No phone available" aria-label="Call unavailable"><i data-lucide="phone" class="icon"></i></span>'}
						<button
							class="workspace-action-icon workspace-action-quick workspace-action-button"
							type="button"
							data-action="quick-view"
							data-customer-id="${escapeHtml(customerId)}"
							data-name="${escapeHtml(customerName)}"
							data-geography="${escapeHtml(geography)}"
							data-risk="${escapeHtml(safeRisk)}"
							data-score="${escapeHtml(scoreRaw)}"
							data-owner="${escapeHtml(String(row.owner || 'Unassigned'))}"
							data-status="${escapeHtml(String(row.status || 'new'))}"
							data-city="${escapeHtml(city)}"
							data-region="${escapeHtml(region)}"
							data-email="${escapeHtml(String(row.synthetic_email || ''))}"
							data-phone="${escapeHtml(String(row.synthetic_phone || ''))}"
							title="Quick view"
							aria-label="Quick view"
						><i data-lucide="user-check" class="icon"></i></button>
					</div>
				</td>
			`;
			tbody.appendChild(tr);
		});
	}

	pagination.dataset.page = String(payload.page);
	pagination.dataset.pageSize = String(payload.page_size);
	pagination.dataset.totalPages = String(payload.total_pages);
	pagination.dataset.totalRows = String(payload.total_rows);

	const filterPageInput = document.querySelector('#workspaceFiltersForm input[name="page"]');
	const filterPageSizeInput = document.querySelector('#workspaceFiltersForm input[name="page_size"]');
	if (filterPageInput) {
		filterPageInput.value = String(payload.page);
	}
	if (filterPageSizeInput) {
		filterPageSizeInput.value = String(payload.page_size);
	}

	const summary = document.getElementById('workspacePaginationSummary');
	const pageInfo = document.getElementById('workspacePageInfo');
	const prevBtn = document.getElementById('workspacePrev');
	const nextBtn = document.getElementById('workspaceNext');

	if (summary) {
		summary.textContent = dataReady ? `${payload.total_rows} rows` : 'No prepared data yet';
	}
	if (pageInfo) {
		if (!dataReady) {
			pageInfo.textContent = 'Run preparation to load data';
		} else if (!hasRows) {
			pageInfo.textContent = 'No matches';
		} else {
			pageInfo.textContent = `Page ${payload.page} / ${payload.total_pages}`;
		}
	}
	if (prevBtn) {
		prevBtn.disabled = !payload.has_prev;
	}
	if (nextBtn) {
		nextBtn.disabled = !payload.has_next;
	}

	if (window.lucide && typeof window.lucide.createIcons === 'function') {
		window.lucide.createIcons();
	}

	const browserParams = new URLSearchParams();
	for (const [key, value] of params.entries()) {
		browserParams.set(key, value);
	}
	browserParams.set('page', String(payload.page || 1));
	window.history.replaceState({}, '', `${window.location.pathname}?${browserParams.toString()}`);
}

function readIntParam(name, fallbackValue) {
	const params = new URLSearchParams(window.location.search);
	const value = Number(params.get(name));
	if (!Number.isFinite(value) || value <= 0) {
		return fallbackValue;
	}
	return Math.floor(value);
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
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

function renderCommunicationStatusBadge(value) {
	const normalized = normalizeCommunicationStatus(value);
	return `<span class="status-badge status-${escapeHtml(normalized)}">${escapeHtml(formatCommunicationStatusLabel(normalized))}</span>`;
}

function renderWorkspaceEmptyRow(tbody, message) {
	const tr = document.createElement('tr');
	tr.className = 'workspace-empty-row';
	tr.innerHTML = `
		<td colspan="6">
			<div class="workspace-table-empty">
				<div class="workspace-table-empty-icon"><i data-lucide="database" class="icon"></i></div>
				<div>
					<strong>${escapeHtml(message || 'No rows to display.')}</strong>
				</div>
			</div>
		</td>
	`;
	tbody.appendChild(tr);
}

function setQuickViewContent(data) {
	const byId = (id) => document.getElementById(id);
	const scoreNumber = Number(data.score || 0);
	const scoreText = Number.isFinite(scoreNumber)
		? `${Math.max(0, Math.min(100, Math.round(scoreNumber * 100)))}%`
		: '0%';
	const regionText = [data.city, data.region].filter(Boolean).join(', ') || '-';

	byId('workspaceQuickViewName').textContent = data.name || 'Unknown';
	byId('workspaceQuickViewCustomerId').textContent = data.customerId || '';
	byId('workspaceQuickViewGeo').textContent = data.geography || 'Unknown';
	byId('workspaceQuickViewRisk').textContent = data.risk || 'Low';
	byId('workspaceQuickViewScore').textContent = scoreText;
	byId('workspaceQuickViewOwner').textContent = data.owner || 'Unassigned';
	const statusElement = byId('workspaceQuickViewStatus');
	if (statusElement) {
		const normalizedStatus = normalizeCommunicationStatus(data.status || 'new');
		statusElement.className = `status-badge status-${normalizedStatus}`;
		statusElement.textContent = formatCommunicationStatusLabel(normalizedStatus);
	}
	byId('workspaceQuickViewRegion').textContent = regionText;
	byId('workspaceQuickViewEmail').textContent = data.email || 'Not available';
	byId('workspaceQuickViewPhone').textContent = data.phone || 'Not available';

	const detailsLink = byId('workspaceQuickViewDetails');
	detailsLink.href = `/customer/${encodeURIComponent(String(data.customerId || ''))}`;
}

function openQuickViewFromButton(button) {
	const modal = document.getElementById('workspaceQuickViewModal');
	if (!modal) {
		return;
	}

	setQuickViewContent({
		customerId: button.dataset.customerId || '',
		name: button.dataset.name || '',
		geography: button.dataset.geography || '',
		risk: button.dataset.risk || '',
		score: button.dataset.score || '',
		owner: button.dataset.owner || '',
		status: button.dataset.status || '',
		city: button.dataset.city || '',
		region: button.dataset.region || '',
		email: button.dataset.email || '',
		phone: button.dataset.phone || '',
	});

	modal.hidden = false;
	document.body.classList.add('workspace-quick-view-open');
}

function closeQuickView() {
	const modal = document.getElementById('workspaceQuickViewModal');
	if (!modal) {
		return;
	}

	modal.hidden = true;
	document.body.classList.remove('workspace-quick-view-open');
}

function showNotice(message) {
	window.alert(message);
}

function exportWorkspaceTableCsv() {
	const table = document.getElementById('workspaceTable');
	if (!table) {
		showNotice('Workspace table not found.');
		return;
	}

	if (table.querySelector('.workspace-empty-row')) {
		showNotice('No prepared data yet. Please run the preparation script first.');
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
	a.download = 'workspace_page.csv';
	a.click();
	URL.revokeObjectURL(url);
}

function bulkAssignCurrentPage() {
	const table = document.getElementById('workspaceTable');
	const pagination = document.getElementById('workspacePagination');
	if (!table) {
		return;
	}

	if (table.querySelector('.workspace-empty-row')) {
		showNotice('No prepared data yet. Please run the preparation script first.');
		return;
	}

	const ownerName = window.prompt('Assign owner name for all rows on this page:', 'Retention Team');
	if (!ownerName) {
		return;
	}

	const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
	const customerIds = bodyRows
		.map((row) => {
			const fromDataset = String(row.dataset.customerId || '').trim();
			if (fromDataset) {
				return fromDataset;
			}
			const detailsLink = row.querySelector('a[href^="/customer/"]');
			if (!detailsLink) {
				return '';
			}
			const href = detailsLink.getAttribute('href') || '';
			const parts = href.split('/').filter(Boolean);
			return parts.length > 1 ? decodeURIComponent(parts[1]) : '';
		})
		.filter(Boolean);

	fetch('/api/workspace/bulk-assign', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			customer_ids: customerIds,
			owner: ownerName,
		}),
	})
		.then(async (response) => {
			const payload = await response.json().catch(() => ({}));
			if (!response.ok) {
				throw new Error(payload.error || `Bulk assign failed: ${response.status}`);
			}
			const currentPage = Number(pagination && pagination.dataset.page ? pagination.dataset.page : 1);
			const currentSize = Number(pagination && pagination.dataset.pageSize ? pagination.dataset.pageSize : 50);
			await loadWorkspacePage(currentPage, currentSize);
			showNotice(payload.message || `Assigned ${customerIds.length} row(s) to ${ownerName}.`);
		})
		.catch((error) => {
			console.error('Failed to bulk assign workspace rows', error);
			showNotice('Bulk assign failed. Please try again.');
		});
}

document.addEventListener('DOMContentLoaded', function () {
	const table = document.getElementById('workspaceTable');
	const pagination = document.getElementById('workspacePagination');
	if (!table || !pagination) {
		return;
	}

	const pageSizeSelect = document.getElementById('workspacePageSize');
	const prevBtn = document.getElementById('workspacePrev');
	const nextBtn = document.getElementById('workspaceNext');
	const filterForm = document.getElementById('workspaceFiltersForm');
	const filterPageInput = filterForm ? filterForm.querySelector('input[name="page"]') : null;
	const filterPageSizeInput = filterForm ? filterForm.querySelector('input[name="page_size"]') : null;

	const initialPageSize = readIntParam('page_size', Number(pagination.dataset.pageSize || 50));
	if (pageSizeSelect) {
		pageSizeSelect.value = String(initialPageSize);
	}
	if (filterPageInput) {
		filterPageInput.value = '1';
	}
	if (filterPageSizeInput) {
		filterPageSizeInput.value = String(initialPageSize);
	}

	loadWorkspacePage(readIntParam('page', 1), initialPageSize).catch((error) => {
		console.error('Failed to load workspace page', error);
	});

	if (prevBtn) {
		prevBtn.addEventListener('click', function () {
			const currentPage = Number(pagination.dataset.page || 1);
			const currentSize = Number(pagination.dataset.pageSize || 50);
			loadWorkspacePage(Math.max(1, currentPage - 1), currentSize).catch((error) => {
				console.error('Failed to load previous page', error);
			});
		});
	}

	if (nextBtn) {
		nextBtn.addEventListener('click', function () {
			const currentPage = Number(pagination.dataset.page || 1);
			const currentSize = Number(pagination.dataset.pageSize || 50);
			loadWorkspacePage(currentPage + 1, currentSize).catch((error) => {
				console.error('Failed to load next page', error);
			});
		});
	}

	if (pageSizeSelect) {
		pageSizeSelect.addEventListener('change', function () {
			const nextSize = Number(pageSizeSelect.value || 50);
			if (filterPageSizeInput) {
				filterPageSizeInput.value = String(nextSize);
			}
			loadWorkspacePage(1, nextSize).catch((error) => {
				console.error('Failed to change page size', error);
			});
		});
	}

	if (filterForm) {
		filterForm.addEventListener('submit', function () {
			if (filterPageInput) {
				filterPageInput.value = '1';
			}
			if (filterPageSizeInput) {
				filterPageSizeInput.value = String(Number(pagination.dataset.pageSize || pageSizeSelect?.value || 50));
			}
		});
	}

	const exportBtn = document.getElementById('workspaceExportBtn');
	if (exportBtn) {
		exportBtn.addEventListener('click', exportWorkspaceTableCsv);
	}

	const bulkAssignBtn = document.getElementById('workspaceBulkAssignBtn');
	if (bulkAssignBtn) {
		bulkAssignBtn.addEventListener('click', bulkAssignCurrentPage);
	}

	table.addEventListener('click', function (event) {
		const target = event.target;
		if (!(target instanceof Element)) {
			return;
		}
		const quickViewBtn = target.closest('[data-action="quick-view"]');
		if (!quickViewBtn) {
			return;
		}
		event.preventDefault();
		openQuickViewFromButton(quickViewBtn);
	});

	const quickViewModal = document.getElementById('workspaceQuickViewModal');
	if (quickViewModal) {
		quickViewModal.addEventListener('click', function (event) {
			const target = event.target;
			if (target instanceof Element && target.getAttribute('data-close') === 'true') {
				closeQuickView();
			}
		});
	}

	const quickViewCloseBtn = document.getElementById('workspaceQuickViewClose');
	if (quickViewCloseBtn) {
		quickViewCloseBtn.addEventListener('click', closeQuickView);
	}

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape') {
			closeQuickView();
		}
	});
});
