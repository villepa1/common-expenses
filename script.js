let totalCommune = 0;
let totalPersonnelle = 0;

function ajouterDepense() {
  const commune = parseFloat(document.getElementById("commune").value) || 0;
  const personnelle =
    parseFloat(document.getElementById("personnelle").value) || 0;

  totalCommune += commune;
  totalPersonnelle += personnelle;

  document.getElementById("totalCommune").textContent = totalCommune.toFixed(2);
  document.getElementById("totalPersonnelle").textContent =
    totalPersonnelle.toFixed(2);

  document.getElementById("commune").value = "";
  document.getElementById("personnelle").value = "";
}
