(function () {
  const DEFAULT_LIMIT = 10;

  function toLimit(value, rowCount) {
    if (value === "all") {
      return rowCount;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return DEFAULT_LIMIT;
    }

    return Math.floor(parsed);
  }

  function applyLimit(rows, limit) {
    rows.forEach((row, index) => {
      row.style.display = index < limit ? "" : "none";
    });
  }

  function buildControls(table, rows) {
    const controlBar = document.createElement("div");
    controlBar.className = "table-limit-controls";

    const label = document.createElement("label");
    label.className = "table-limit-label";
    label.textContent = "Rows per view";

    const select = document.createElement("select");
    select.className = "table-limit-select";
    ["10", "25", "50", "all"].forEach((optionValue) => {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = optionValue === "all" ? "All" : optionValue;
      if (optionValue === "10") {
        option.selected = true;
      }
      select.appendChild(option);
    });

    const count = document.createElement("span");
    count.className = "table-limit-count";
    count.textContent = `${rows.length} rows total`;

    label.appendChild(select);
    controlBar.appendChild(label);
    controlBar.appendChild(count);

    select.addEventListener("change", function () {
      const limit = toLimit(select.value, rows.length);
      applyLimit(rows, limit);
    });

    return controlBar;
  }

  document.addEventListener("DOMContentLoaded", function () {
    const tables = document.querySelectorAll("table.data-table");

    tables.forEach((table) => {
      if (table.dataset.disableLimit === "true") {
        return;
      }

      const body = table.tBodies && table.tBodies[0];
      if (!body) {
        return;
      }

      const rows = Array.from(body.rows);
      if (rows.length <= DEFAULT_LIMIT) {
        return;
      }

      const controls = buildControls(table, rows);
      table.parentNode.insertBefore(controls, table);
      applyLimit(rows, DEFAULT_LIMIT);
    });
  });
})();
