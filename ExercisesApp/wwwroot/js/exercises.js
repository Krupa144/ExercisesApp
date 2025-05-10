const apiUrl = "https://localhost:44300";
let allExercises = [];
let editingExerciseId = null;

function categoryName(val) {
  return ["FullBody", "Push", "Pull", "Legs"][val] || "Nieznana";
}

function getAuthToken() {
  return sessionStorage.getItem('authToken');
}

async function loadExercises() {
  const token = getAuthToken();
  if (!token) return alert("Musisz być zalogowany.");

  try {
    const res = await fetch(`${apiUrl}/api/exercises`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    allExercises = await res.json();
    initializeFilters();
    updateProgressChart();
    filterExercises();
  } catch {
    alert("Nie udało się załadować ćwiczeń.");
  }
}

function updateProgressChart() {
  const list = document.getElementById("progress-list");
  list.innerHTML = "";

  const recent = allExercises.filter(e => new Date(e.date) >= new Date(Date.now() - 30 * 864e5));

  const grouped = {};
  for (const ex of recent) {
    grouped[ex.name] = grouped[ex.name] || [];
    grouped[ex.name].push(ex);
  }

  Object.entries(grouped).forEach(([name, entries]) => {
    if (entries.length < 2) return;

    entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    const first = entries[0].weight;
    const last = entries.at(-1).weight;
    const change = (((last - first) / first) * 100).toFixed(1);

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>${name}</span>
      <span class="badge ${change >= 0 ? 'bg-success' : 'bg-danger'} rounded-pill">
        ${change >= 0 ? '+' : ''}${change}%
      </span>`;
    list.appendChild(li);
  });

  if (!list.children.length)
    list.innerHTML = '<li class="list-group-item">Brak danych do obliczenia progresu</li>';
}

function filterExercises() {
  const tbody = document.querySelector("#exercisesTable tbody");
  tbody.innerHTML = "";

  const name = document.getElementById("exercise-name-filter").value.toLowerCase();
  const date = document.getElementById("exercise-date-filter").value;
  const category = document.body.dataset.category;

  const filtered = allExercises.filter(e =>
    (!name || e.name.toLowerCase().includes(name)) &&
    (!date || e.date.startsWith(date)) &&
    (!category || category === "0" || parseInt(category) === e.category)
  );

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Brak ćwiczeń</td></tr>`;
    return;
  }

  for (const ex of filtered) {
    const tr = tbody.insertRow();
    tr.innerHTML = `
      <td>${ex.name}</td>
      <td>${categoryName(ex.category)}</td>
      <td>${ex.sets}</td>
      <td>${ex.reps}</td>
      <td>${ex.weight} kg</td>
      <td>${ex.date.split("T")[0]}</td>
      <td>
        <button class="btn btn-sm btn-warning me-2" onclick="editExercise(${ex.id})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteExercise(${ex.id})">
          <i class="bi bi-trash"></i>
        </button>
      </td>`;
  }
}

function initializeFilters() {
  const nameSelect = document.getElementById("exercise-name-filter");
  const uniqueNames = [...new Set(allExercises.map(e => e.name))].sort();
  nameSelect.innerHTML = `<option value="">Wszystkie ćwiczenia</option>` +
    uniqueNames.map(n => `<option value="${n}">${n}</option>`).join("");

  nameSelect.onchange = filterExercises;
  document.getElementById("exercise-date-filter").onchange = filterExercises;
}

function editExercise(id) {
  const ex = allExercises.find(e => e.id === id);
  if (!ex) return alert("Nie znaleziono ćwiczenia.");

  document.getElementById("editForm").style.display = "block";
  document.getElementById("edit-name").value = ex.name;
  document.getElementById("edit-date").value = ex.date.split("T")[0];
  document.getElementById("edit-sets").value = ex.sets;
  document.getElementById("edit-reps").value = ex.reps;
  document.getElementById("edit-weight").value = ex.weight;
  editingExerciseId = id;
}

function cancelEdit() {
  document.getElementById("editForm").style.display = "none";
  editingExerciseId = null;
}

async function updateExercise() {
  const token = getAuthToken();
  if (!token || !editingExerciseId) return;

  const updated = {
    id: editingExerciseId,
    name: document.getElementById("edit-name").value,
    date: document.getElementById("edit-date").value,
    sets: +document.getElementById("edit-sets").value,
    reps: +document.getElementById("edit-reps").value,
    weight: +document.getElementById("edit-weight").value
  };

  try {
    const res = await fetch(`${apiUrl}/api/exercises/${editingExerciseId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updated)
    });

    if (!res.ok) throw new Error();
    alert("Ćwiczenie zaktualizowane.");
    cancelEdit();
    loadExercises();
  } catch {
    alert("Nie udało się zaktualizować ćwiczenia.");
  }
}

async function deleteExercise(id) {
  if (!confirm("Czy na pewno chcesz usunąć to ćwiczenie?")) return;

  const token = getAuthToken();
  try {
    const res = await fetch(`${apiUrl}/api/exercises/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error();
    alert("Ćwiczenie usunięte.");
    loadExercises();
  } catch {
    alert("Nie udało się usunąć ćwiczenia.");
  }
}


document.addEventListener("DOMContentLoaded", function () {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("exercise-date-filter").value = today;
});


document.addEventListener("DOMContentLoaded", loadExercises);
