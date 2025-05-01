let allExercises = [];
let editingExerciseId = null;
let selectedExerciseName = "";
let selectedDate = "";
let progressLog = [];
const apiUrl = "https://localhost:44300";
const categoryId = parseInt(document.body.getAttribute("data-category"));

// Kategorie
function categoryName(categoryValue) {
  switch (categoryValue) {
    case 0: return "FullBody";
    case 1: return "Push";
    case 2: return "Pull";
    case 3: return "Legs";
    default: return "Nieznana";
  }
}

// Ładowanie ćwiczeń
async function loadExercises() {
  try {
    const response = await fetch(`${apiUrl}/exercises`);
    const exercises = await response.json();
    allExercises = exercises.filter(ex => ex.category === categoryId);

    calculateProgress();
    renderExercises();
    renderProgress();  // <= WAŻNE!
    populateExerciseNames();
  } catch (error) {
    console.error("Błąd ładowania ćwiczeń:", error);
  }
}


// Obliczanie progresu
function calculateProgress() {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  progressLog = [];

  const todayDateStr = today.toISOString().split('T')[0];
  const todayExercises = allExercises.filter(ex => ex.date.split('T')[0] === todayDateStr);

  todayExercises.forEach(todayEx => {
    const pastSimilar = allExercises
      .filter(ex =>
        ex.name === todayEx.name &&
        new Date(ex.date) >= oneMonthAgo &&
        new Date(ex.date) < today &&
        ex.id !== todayEx.id
      );

    if (pastSimilar.length > 0) {
      const maxPastWeight = Math.max(...pastSimilar.map(ex => ex.weight));
      if (todayEx.weight > maxPastWeight) {
        const diff = todayEx.weight - maxPastWeight;
        progressLog.push({
          name: todayEx.name,
          weightGain: diff,
          date: todayDateStr
        });
        console.log(`Progress w ćwiczeniu ${todayEx.name}: +${diff}kg`);
      }
    }
  });
}

// Filtrowanie i renderowanie ćwiczeń
function renderExercises() {
  const list = document.getElementById("exercises-list");
  list.innerHTML = "";

  const today = new Date().toISOString().split('T')[0];
  let filtered = [...allExercises];

  if (selectedExerciseName) {
    filtered = filtered.filter(ex => ex.name === selectedExerciseName);
  }

  if (selectedDate) {
    filtered = filtered.filter(ex => ex.date.split('T')[0] === selectedDate);
  }

  // Domyślnie pokazuj tylko dzisiejsze ćwiczenia
  if (!selectedExerciseName && !selectedDate) {
    filtered = filtered.filter(ex => ex.date.split('T')[0] === today);
  }

  if (filtered.length === 0) {
    list.innerHTML = `<li class="list-group-item text-muted">Brak ćwiczeń do wyświetlenia.</li>`;
    return;
  }

  filtered.forEach(ex => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-start";
    const date = new Date(ex.date).toLocaleDateString("pl-PL");
    li.innerHTML = `
      <div>
        <strong>${ex.name}</strong><br>
        Serie: ${ex.sets}, Powtórzenia: ${ex.reps}, Ciężar: ${ex.weight} kg<br>
        Kategoria: ${categoryName(ex.category)}<br>
        Data: ${date}
      </div>
      <div>
        <button class="btn btn-sm btn-warning me-2" onclick="editExercise(${ex.id})">Edytuj</button>
        <button class="btn btn-sm btn-danger" onclick="deleteExercise(${ex.id})">Usuń</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// Uzupełnianie dropdowna nazw ćwiczeń
function populateExerciseNames() {
  const nameFilter = document.getElementById("exercise-name-filter");
  const names = [...new Set(allExercises.map(ex => ex.name))];

  nameFilter.innerHTML = `<option value="">-- Wszystkie ćwiczenia --</option>`;
  names.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    nameFilter.appendChild(option);
  });
}

// Obsługa filtrów
function setupFilters() {
  const nameFilter = document.getElementById("exercise-name-filter");
  const dateFilter = document.getElementById("exercise-date-filter");

  nameFilter.addEventListener("change", (e) => {
    selectedExerciseName = e.target.value;
    renderExercises();
  });

  dateFilter.addEventListener("change", (e) => {
    selectedDate = e.target.value;
    renderExercises();
  });
}

// Edycja ćwiczenia
async function editExercise(id) {
  try {
    const response = await fetch(`${apiUrl}/exercises/${id}`);
    const ex = await response.json();

    document.getElementById("edit-name").value = ex.name;
    document.getElementById("edit-sets").value = ex.sets;
    document.getElementById("edit-reps").value = ex.reps;
    document.getElementById("edit-weight").value = ex.weight;
    document.getElementById("edit-date").value = ex.date.split('T')[0];
    editingExerciseId = id;

    document.getElementById("editForm").style.display = 'block';
  } catch (error) {
    console.error("Błąd ładowania ćwiczenia:", error);
    alert("Błąd podczas edytowania ćwiczenia!");
  }
}

// Aktualizacja ćwiczenia
async function updateExercise() {
  const updated = {
    id: editingExerciseId,
    name: document.getElementById("edit-name").value,
    sets: parseInt(document.getElementById("edit-sets").value),
    reps: parseInt(document.getElementById("edit-reps").value),
    weight: parseInt(document.getElementById("edit-weight").value),
    date: document.getElementById("edit-date").value,
    category: categoryId
  };

  try {
    const response = await fetch(`${apiUrl}/exercises/${editingExerciseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });

    if (response.ok) {
      alert("Ćwiczenie zaktualizowane!");
      loadExercises();
      cancelEdit();
    } else {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        alert("Błąd podczas aktualizacji: " + (json.message || JSON.stringify(json)));
      } catch {
        alert("Błąd podczas aktualizacji: " + text);
      }
    }
  } catch (error) {
    console.error("Błąd aktualizacji:", error);
    alert("Błąd podczas aktualizacji ćwiczenia!");
  }
}

// Anulowanie edycji
function cancelEdit() {
  document.getElementById("editForm").style.display = 'none';
}

// Usuwanie ćwiczenia
async function deleteExercise(id) {
  if (confirm("Czy na pewno chcesz usunąć to ćwiczenie?")) {
    try {
      const response = await fetch(`${apiUrl}/exercises/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Ćwiczenie usunięte!");
        loadExercises();
      } else {
        alert("Błąd podczas usuwania ćwiczenia!");
      }
    } catch (error) {
      console.error("Błąd usuwania:", error);
      alert("Błąd podczas usuwania ćwiczenia!");
    }
  }
}

function renderProgress() {
  const list = document.getElementById("progress-list");
  list.innerHTML = "";

  if (progressLog.length === 0) {
    list.innerHTML = `<li class="list-group-item text-muted">Brak progresu w ostatnich 30 dniach.</li>`;
    return;
  }

  progressLog.forEach(p => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerHTML = `<strong>${p.name}</strong> – +${p.weightGain} kg (z dnia ${p.date})`;
    list.appendChild(li);
  });
}

// Inicjalizacja
window.onload = () => {
  loadExercises();
  setupFilters();
};
