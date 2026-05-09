document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("yearSpan");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }

  const riskFilter = document.getElementById("riskFilter");
  const tableBody = document.getElementById("logsTableBody");
  const clearBtn = document.getElementById("clearLogsBtn");

  function getAllLogs() {
    try {
      return JSON.parse(localStorage.getItem("passwordLogs") || "[]");
    } catch {
      return [];
    }
  }

  function loadLogs() {
    const all = getAllLogs();
    const risk = riskFilter.value;
    const filtered = risk ? all.filter((log) => log.risk === risk) : all;

    tableBody.innerHTML = "";
    if (!filtered.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.className = "muted";
      td.textContent = "No logs found yet. Try analyzing a password on the Analyzer page.";
      tr.appendChild(td);
      tableBody.appendChild(tr);
      return;
    }

    filtered.forEach((log) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${log.created_at}</td>
        <td>${log.masked_password}</td>
        <td>${log.score}</td>
        <td>${(log.risk || "").toUpperCase()}</td>
        <td>${log.issues}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  if (riskFilter) {
    riskFilter.addEventListener("change", loadLogs);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (!confirm("Clear all stored logs in this browser?")) return;
      localStorage.removeItem("passwordLogs");
      loadLogs();
    });
  }

  loadLogs();
});


