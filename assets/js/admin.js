document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("yearSpan");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }

  const adminLoginForm = document.getElementById("adminLoginForm");
  const adminPassword = document.getElementById("adminPassword");
  const adminLoginMsg = document.getElementById("adminLoginMsg");
  const adminPanel = document.getElementById("adminPanel");

  const statTotal = document.getElementById("statTotal");
  const statAverage = document.getElementById("statAverage");
  const statHigh = document.getElementById("statHigh");

  const barLow = document.getElementById("barLow");
  const barMedium = document.getElementById("barMedium");
  const barHigh = document.getElementById("barHigh");
  const barCritical = document.getElementById("barCritical");
  const criticalTableBody = document.getElementById("criticalTableBody");

  const DEMO_ADMIN_PASSWORD = "labadmin"; // demo only

  async function loadDashboard() {
    try {
      const res = await fetch("backend/get_stats.php");
      const data = await res.json();

      statTotal.textContent = data.total_tests || 0;
      statAverage.textContent = data.avg_score ? data.avg_score.toFixed(1) : "0.0";
      statHigh.textContent = (data.high_or_critical || 0).toString();

      const total = data.total_tests || 0;
      const dist = data.risk_counts || {};

      function pct(num) {
        if (!total) return "0%";
        return Math.round((num / total) * 100) + "%";
      }

      barLow.style.width = pct(dist.low || 0);
      barMedium.style.width = pct(dist.medium || 0);
      barHigh.style.width = pct(dist.high || 0);
      barCritical.style.width = pct(dist.critical || 0);

      criticalTableBody.innerHTML = "";
      if (!data.critical || data.critical.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.className = "muted";
        td.textContent = "No critical passwords recorded.";
        tr.appendChild(td);
        criticalTableBody.appendChild(tr);
      } else {
        data.critical.forEach((row) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${row.created_at}</td>
            <td>${row.masked_password}</td>
            <td>${row.score}</td>
            <td>${row.issues}</td>
          `;
          criticalTableBody.appendChild(tr);
        });
      }
    } catch (e) {
      console.error(e);
      adminLoginMsg.textContent = "Failed to load dashboard data.";
      adminLoginMsg.className = "feedback error";
    }
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = adminPassword.value || "";
      if (value === DEMO_ADMIN_PASSWORD) {
        adminLoginMsg.textContent = "Login successful.";
        adminLoginMsg.className = "feedback success";
        adminPanel.classList.remove("hidden");
        loadDashboard();
      } else {
        adminLoginMsg.textContent = "Invalid admin password (demo: labadmin).";
        adminLoginMsg.className = "feedback error";
      }
    });
  }
});


