let totalCommune = 0;
let totalPersonnelle = 0;

// Load saved data from localStorage
function loadData() {
  const savedData = localStorage.getItem("depenses-data");
  if (savedData) {
    const data = JSON.parse(savedData);
    totalCommune = data.totalCommune || 0;
    totalPersonnelle = data.totalPersonnelle || 0;
    updateDisplay();
  }
}

// Save data to localStorage
function saveData() {
  const data = {
    totalCommune: totalCommune,
    totalPersonnelle: totalPersonnelle,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem("depenses-data", JSON.stringify(data));
}

// Update display with French number formatting
function updateDisplay() {
  document.getElementById("totalCommune").textContent =
    totalCommune.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  document.getElementById("totalPersonnelle").textContent =
    totalPersonnelle.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
}

// Add expense function with improved iPhone UX
function ajouterDepense(event) {
  if (event) {
    event.preventDefault();
  }

  const communeInput = document.getElementById("commune");
  const personnelleInput = document.getElementById("personnelle");

  const commune = parseFloat(communeInput.value) || 0;
  const personnelle = parseFloat(personnelleInput.value) || 0;

  // Check if at least one field has a value
  if (commune === 0 && personnelle === 0) {
    // Add subtle shake animation for feedback
    const form = document.querySelector(".form-grid");
    form.style.animation = "shake 0.3s ease-in-out";
    setTimeout(() => {
      form.style.animation = "";
    }, 300);
    return;
  }

  totalCommune += commune;
  totalPersonnelle += personnelle;

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
    totalCommune = 0;
    totalPersonnelle = 0;
    updateDisplay();
    saveData();

    // Focus on first input
    document.getElementById("commune").focus();

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
        ajouterDepense();
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

  // Handle form submission
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", ajouterDepense);
  }

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
