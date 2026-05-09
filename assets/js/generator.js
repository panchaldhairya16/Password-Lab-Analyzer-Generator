document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("yearSpan");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }

  const lengthInput = document.getElementById("lengthInput");
  const useLower = document.getElementById("useLower");
  const useUpper = document.getElementById("useUpper");
  const useNumbers = document.getElementById("useNumbers");
  const useSymbols = document.getElementById("useSymbols");
  const generateBtn = document.getElementById("generateBtn");
  const generatedSection = document.getElementById("generatedSection");
  const generatedPassword = document.getElementById("generatedPassword");
  const copyBtn = document.getElementById("copyBtn");

  if (!generateBtn) return;

  function generatePassword() {
    const length = Math.max(8, Math.min(64, parseInt(lengthInput.value, 10) || 16));

    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const symbols = "!@#$%^&*()-_=+[]{};:,.<>/?";

    let pools = [];
    if (useLower.checked) pools.push(lower);
    if (useUpper.checked) pools.push(upper);
    if (useNumbers.checked) pools.push(nums);
    if (useSymbols.checked) pools.push(symbols);

    if (pools.length === 0) {
      alert("Select at least one character set.");
      return "";
    }

    const all = pools.join("");
    let pwdChars = [];

    // ensure at least one from each selected pool
    pools.forEach((p) => {
      pwdChars.push(p[Math.floor(Math.random() * p.length)]);
    });

    while (pwdChars.length < length) {
      const ch = all[Math.floor(Math.random() * all.length)];
      // avoid long direct runs
      if (pwdChars.length >= 3) {
        const last3 = pwdChars.slice(-3).join("");
        if (last3.split("").every((c) => c === pwdChars[pwdChars.length - 1])) {
          continue;
        }
      }
      pwdChars.push(ch);
    }

    // shuffle
    for (let i = pwdChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pwdChars[i], pwdChars[j]] = [pwdChars[j], pwdChars[i]];
    }

    return pwdChars.join("");
  }

  generateBtn.addEventListener("click", () => {
    const pwd = generatePassword();
    if (!pwd) return;

    generatedPassword.value = pwd;
    generatedSection.classList.remove("hidden");
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const value = generatedPassword.value;
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
      } catch {
        alert("Unable to copy automatically, please copy manually.");
      }
    });
  }
});


