// Simple shared helpers
const common = (() => {
  const yearSpan = document.getElementById("yearSpan");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }
  return {};
})();

const Analyzer = (() => {
  const commonWords = [
    "password",
    "qwerty",
    "letmein",
    "welcome",
    "admin",
    "login",
    "user",
    "dragon",
    "football",
    "baseball",
    "secret",
    "master",
    "hello",
    "iloveyou",
  ];

  const keyboardSequences = [
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
    "1234567890",
    "!@#$%^&*()",
  ];

  function detectRepeats(password) {
    const matches = password.match(/(.)\1{2,}/g);
    if (!matches) return null;
    return {
      label: "Repeated characters",
      details: `Contains repeated characters like ${matches.join(", ")}`,
      weight: 12,
    };
  }

  function detectSequences(password) {
    const lowered = password.toLowerCase();
    let found = [];

    keyboardSequences.forEach((seq) => {
      for (let i = 0; i <= seq.length - 3; i++) {
        const part = seq.slice(i, i + 3);
        if (lowered.includes(part)) {
          found.push(part);
        }
      }
      const rev = seq.split("").reverse().join("");
      for (let i = 0; i <= rev.length - 3; i++) {
        const part = rev.slice(i, i + 3);
        if (lowered.includes(part)) {
          found.push(part);
        }
      }
    });

    const numericSeq = /0123|1234|2345|3456|4567|5678|6789|7890/;
    if (numericSeq.test(lowered)) {
      found.push("numeric sequence");
    }

    if (!found.length) return null;
    return {
      label: "Keyboard / numeric sequences",
      details: `Contains sequential patterns like ${[...new Set(found)].join(", ")}`,
      weight: 18,
    };
  }

  function detectCommonWords(password) {
    const lowered = password.toLowerCase();

    // treat common substitutions
    const normalized = lowered
      .replace(/0/g, "o")
      .replace(/1/g, "l")
      .replace(/3/g, "e")
      .replace(/4/g, "a")
      .replace(/5/g, "s")
      .replace(/7/g, "t")
      .replace(/@/g, "a")
      .replace(/\$/g, "s");

    const found = commonWords.filter((w) => normalized.includes(w));
    if (!found.length) return null;
    return {
      label: "Common words / patterns",
      details: `Looks similar to common weak passwords: ${found.join(", ")}`,
      weight: 22,
    };
  }

  function detectCharacterDiversity(password) {
    let sets = 0;
    if (/[a-z]/.test(password)) sets++;
    if (/[A-Z]/.test(password)) sets++;
    if (/[0-9]/.test(password)) sets++;
    if (/[^a-zA-Z0-9]/.test(password)) sets++;

    if (sets >= 3) {
      return {
        scoreBonus: 18,
        label: "Good character diversity",
      };
    }
    if (sets === 2) {
      return {
        scoreBonus: 8,
        label: "Moderate character diversity",
      };
    }
    return {
      scoreBonus: 0,
      label: "Low character diversity",
    };
  }

  function analyze(password) {
    let score = 0;
    const issues = [];

    if (!password || password.trim().length === 0) {
      return {
        score: 0,
        risk: "critical",
        strength: "Very Weak",
        issues: ["Password is empty."],
      };
    }

    const len = password.length;
    if (len < 8) {
      issues.push("Password is very short (less than 8 characters).");
      score += 5;
    } else if (len < 12) {
      issues.push("Password could be longer (less than 12 characters).");
      score += 15;
    } else if (len < 16) {
      score += 25;
    } else {
      score += 35;
    }

    const diversity = detectCharacterDiversity(password);
    score += diversity.scoreBonus;
    if (diversity.scoreBonus === 0) {
      issues.push("Use a mix of upper, lower, numbers, and symbols.");
    }

    const repeatIssue = detectRepeats(password);
    if (repeatIssue) {
      score -= repeatIssue.weight;
      issues.push(repeatIssue.details);
    }

    const seqIssue = detectSequences(password);
    if (seqIssue) {
      score -= seqIssue.weight;
      issues.push(seqIssue.details);
    }

    const wordIssue = detectCommonWords(password);
    if (wordIssue) {
      score -= wordIssue.weight;
      issues.push(wordIssue.details);
    }

    if (/^[a-z]+$/i.test(password) || /^[0-9]+$/.test(password)) {
      issues.push("Avoid using only letters or only numbers.");
      score -= 8;
    }

    score = Math.max(0, Math.min(100, score));

    let risk = "medium";
    let strengthLabel = "Moderate";
    if (score < 30) {
      risk = "critical";
      strengthLabel = "Very Weak";
    } else if (score < 50) {
      risk = "high";
      strengthLabel = "Weak";
    } else if (score < 75) {
      risk = "medium";
      strengthLabel = "Moderate";
    } else {
      risk = "low";
      strengthLabel = "Strong";
    }

    if (issues.length === 0) {
      issues.push("No major issues detected. This looks strong for most uses.");
    }

    return {
      score,
      risk,
      strength: strengthLabel,
      issues,
    };
  }

  return { analyze };
})();

document.addEventListener("DOMContentLoaded", () => {
  const pwdInput = document.getElementById("passwordInput");
  const showToggle = document.getElementById("showPasswordToggle");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const analysisSection = document.getElementById("analysisResult");
  const strengthLabel = document.getElementById("strengthLabel");
  const strengthBarFill = document.getElementById("strengthBarFill");
  const issuesList = document.getElementById("issuesList");
  const overallRisk = document.getElementById("overallRisk");

  if (!pwdInput || !analyzeBtn) return;

  if (showToggle) {
    showToggle.addEventListener("change", () => {
      pwdInput.type = showToggle.checked ? "text" : "password";
    });
  }

  function maskPassword(pwd) {
    const len = pwd.length;
    if (len <= 2) return "*".repeat(len);
    return pwd[0] + "*".repeat(len - 2) + pwd[len - 1];
  }

  function saveLog(entry) {
    try {
      const key = "passwordLogs";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(entry);
      // keep last 500 entries
      if (existing.length > 500) existing.length = 500;
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.error("Unable to save log", e);
    }
  }

  analyzeBtn.addEventListener("click", () => {
    const pwd = pwdInput.value || "";
    const result = Analyzer.analyze(pwd);

    // update UI
    analysisSection.classList.remove("hidden");
    strengthLabel.textContent = `${result.strength} (${result.score}/100)`;
    strengthBarFill.style.width = `${result.score}%`;

    overallRisk.textContent = `Risk level: ${result.risk.toUpperCase()}`;
    overallRisk.className = `overall-risk ${result.risk}`;

    issuesList.innerHTML = "";
    result.issues.forEach((msg) => {
      const li = document.createElement("li");
      li.textContent = msg;
      issuesList.appendChild(li);
    });

    // store log locally in browser (no backend)
    const entry = {
      created_at: new Date().toLocaleString(),
      masked_password: maskPassword(pwd),
      score: result.score,
      risk: result.risk,
      issues: result.issues.join("; "),
      source: "analyzer",
    };
    saveLog(entry);
  });
});


