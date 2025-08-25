// Data structure for Julie and Paul
let data = {
  julie: {
    commune: 0,
    personnelle: 0, // Paul's personal expenses on Julie's account
  },
  paul: {
    commune: 0,
    personnelle: 0, // Julie's personal expenses on Paul's account
  },
};

// Load saved data from localStorage
function loadData() {
  const savedData = localStorage.getItem("depenses-data");
  if (savedData) {
    const parsedData = JSON.parse(savedData);

    // Handle legacy data format
    if (parsedData.totalCommune !== undefined) {
      // Legacy format - convert to new structure
      data.julie.commune = parsedData.totalCommune || 0;
      data.julie.personnelle = parsedData.totalPersonnelle || 0;
      data.paul.commune = 0;
      data.paul.personnelle = 0;
    } else {
      // New format
      data = {
        julie: {
          commune: parsedData.julie?.commune || 0,
          personnelle: parsedData.julie?.personnelle || 0,
        },
        paul: {
          commune: parsedData.paul?.commune || 0,
          personnelle: parsedData.paul?.personnelle || 0,
        },
      };
    }
    updateDisplay();
  }
}

// Save data to localStorage
function saveData() {
  const saveData = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem("depenses-data", JSON.stringify(saveData));
}

// Update display with French number formatting
function updateDisplay() {
  // Julie's totals
  document.getElementById("totalCommune-julie").textContent =
    data.julie.commune.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  document.getElementById("totalPersonnelle-julie").textContent =
    data.julie.personnelle.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Paul's totals
  document.getElementById("totalCommune-paul").textContent =
    data.paul.commune.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  document.getElementById("totalPersonnelle-paul").textContent =
    data.paul.personnelle.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Global totals
  const totalCommuneGlobal = data.julie.commune + data.paul.commune;
  document.getElementById("totalCommuneGlobal").textContent =
    totalCommuneGlobal.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Balance calculation with 50/50 common expenses and 100% personal refunds

  // Calculate what each person should pay for common expenses (50/50 split)
  const eachPersonShouldPayCommon = totalCommuneGlobal / 2;

  // Calculate how much each person actually paid for common expenses
  const julieActuallyPaidCommon = data.julie.commune;
  const paulActuallyPaidCommon = data.paul.commune;

  // Calculate common expense balance (positive = Julie overpaid, negative = Paul overpaid)
  const commonExpenseBalance =
    julieActuallyPaidCommon - eachPersonShouldPayCommon;

  // Personal expenses to be refunded 100%
  const paulOwesJuliePersonal = data.julie.personnelle; // Paul's personal expenses on Julie's account
  const julieOwesPaulPersonal = data.paul.personnelle; // Julie's personal expenses on Paul's account

  // Final balance calculation:
  // Positive = Paul owes Julie, Negative = Julie owes Paul
  const finalBalance =
    commonExpenseBalance + paulOwesJuliePersonal - julieOwesPaulPersonal;

  const balanceElement = document.getElementById("balanceAmount");
  const balanceInfoElement = document.getElementById("balanceInfo");

  balanceElement.textContent = Math.abs(finalBalance).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (finalBalance > 0.01) {
    // Paul owes Julie
    balanceInfoElement.textContent = "Paul doit envoyer à Julie";
    balanceElement.parentElement.parentElement.className =
      "total-card global balance owes-julie";
  } else if (finalBalance < -0.01) {
    // Julie owes Paul
    balanceInfoElement.textContent = "Julie doit envoyer à Paul";
    balanceElement.parentElement.parentElement.className =
      "total-card global balance owes-paul";
  } else {
    // Balanced (within 1 cent)
    balanceInfoElement.textContent = "Parfaitement équilibré";
    balanceElement.parentElement.parentElement.className =
      "total-card global balance balanced";
  }
}

// Add expense function with improved iPhone UX
function ajouterDepense(event, person) {
  if (event) {
    event.preventDefault();
  }

  const communeInput = document.getElementById(`commune-${person}`);
  const personnelleInput = document.getElementById(`personnelle-${person}`);

  const commune = parseFloat(communeInput.value) || 0;
  const personnelle = parseFloat(personnelleInput.value) || 0;

  // Check if at least one field has a value
  if (commune === 0 && personnelle === 0) {
    // Add subtle shake animation for feedback
    const form = event.target.closest(".form-grid");
    form.style.animation = "shake 0.3s ease-in-out";
    setTimeout(() => {
      form.style.animation = "";
    }, 300);
    return;
  }

  // Add to the appropriate person's data
  data[person].commune += commune;
  data[person].personnelle += personnelle;

  updateDisplay();
  saveData();

  // Clear inputs
  communeInput.value = "";
  personnelleInput.value = "";

  // Focus on first input for continuous use
  communeInput.focus();

  // Add success feedback with haptic on iPhone
  if (navigator.vibrate) {
    navigator.vibrate(50); // Short vibration for feedback
  }
}

// Reset totals function
function resetTotals() {
  if (confirm("Êtes-vous sûr de vouloir remettre tous les totaux à zéro ?")) {
    data = {
      julie: {
        commune: 0,
        personnelle: 0,
      },
      paul: {
        commune: 0,
        personnelle: 0,
      },
    };
    updateDisplay();
    saveData();

    // Focus on first input
    document.getElementById("commune-julie").focus();

    // Haptic feedback for reset
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]); // Double vibration for reset
    }
  }
}

// iPhone-specific optimizations
document.addEventListener("DOMContentLoaded", function () {
  loadData();

  // Prevent zoom on input focus (backup to CSS solution)
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      // Add focused state for visual feedback
      this.parentElement.classList.add("focused");
    });

    input.addEventListener("blur", function () {
      this.parentElement.classList.remove("focused");
    });

    // Allow Enter key to submit
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        // Find which person's form this input belongs to
        const form = this.closest("form");
        const person = form.getAttribute("onsubmit").includes("julie")
          ? "julie"
          : "paul";
        ajouterDepense(e, person);
      }
    });
  });

  // Add keyboard support
  document.addEventListener("keydown", function (e) {
    // Cmd+R or Ctrl+R for reset (with confirmation)
    if ((e.metaKey || e.ctrlKey) && e.key === "r") {
      e.preventDefault();
      resetTotals();
    }
  });

  // Handle form submission for both forms
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const person = this.getAttribute("onsubmit").includes("julie")
        ? "julie"
        : "paul";
      ajouterDepense(e, person);
    });
  });

  // Add PWA-like behavior - prevent pull-to-refresh
  let startY = 0;
  document.addEventListener("touchstart", function (e) {
    startY = e.touches[0].pageY;
  });

  document.addEventListener(
    "touchmove",
    function (e) {
      const y = e.touches[0].pageY;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // Prevent pull-to-refresh when at top of page
      if (scrollTop === 0 && y > startY) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // Auto-save every 30 seconds as backup
  setInterval(saveData, 30000);
});

// Add shake animation for error feedback
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .input-group.focused {
    transform: translateY(-1px);
  }
  
  .input-group.focused .label {
    color: var(--primary);
  }
`;
document.head.appendChild(style);
