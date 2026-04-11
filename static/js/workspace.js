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

	payload.rows.forEach((row) => {
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td>${row.customer_id}</td>
			<td><a href="/customer/${row.customer_id}">${row.name}</a></td>
			<td>${row.geography}</td>
			<td><span class="risk-badge risk-${String(row.risk || 'Low').toLowerCase()}">${row.risk}</span></td>
			<td>${Number(row.score || 0).toFixed(3)}</td>
			<td>${row.owner}</td>
			<td>${row.status}</td>
		`;
		tbody.appendChild(tr);
	});

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
		summary.textContent = `${payload.total_rows} rows`; 
	}
	if (pageInfo) {
		pageInfo.textContent = `Page ${payload.page} / ${payload.total_pages}`;
	}
	if (prevBtn) {
		prevBtn.disabled = !payload.has_prev;
	}
	if (nextBtn) {
		nextBtn.disabled = !payload.has_next;
	}

	const browserParams = new URLSearchParams();
	for (const [key, value] of params.entries()) {
		browserParams.set(key, value);
	}
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

function showNotice(message) {
	window.alert(message);
}

function exportWorkspaceTableCsv() {
	const table = document.getElementById('workspaceTable');
	if (!table) {
		showNotice('Workspace table not found.');
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

	const ownerName = window.prompt('Assign owner name for all rows on this page:', 'Retention Team');
	if (!ownerName) {
		return;
	}

	const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
	const customerIds = bodyRows
		.map((row) => (row.cells[0] ? row.cells[0].textContent.trim() : ''))
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
});
