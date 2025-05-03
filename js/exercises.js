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

// Pobierz token autoryzacyjny
function getAuthToken() {
  return sessionStorage.getItem('authToken'); // Zwraca token JWT z sessionStorage
}

// Obsługa formularza dodawania ćwiczenia
document.getElementById('exerciseForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const authToken = getAuthToken(); // Pobieramy token JWT z sessionStorage
  const messageDiv = document.getElementById('exerciseMessage');

  if (!authToken) {
      messageDiv.style.color = "red";
      messageDiv.innerText = "Musisz być zalogowany, aby dodać ćwiczenie.";
      return;
  }

  const exerciseData = {
      name: document.getElementById('name').value,
      category: parseInt(document.getElementById('category').value),
      sets: parseInt(document.getElementById('sets').value),
      reps: parseInt(document.getElementById('reps').value),
      weight: parseFloat(document.getElementById('weight').value),
      date: document.getElementById('date').value
  };

  try {
      const response = await fetch('https://localhost:44300/api/exercises', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}` // Dodanie tokenu w nagłówku
          },
          body: JSON.stringify(exerciseData)
      });

      if (response.ok) {
          messageDiv.style.color = "green";
          messageDiv.innerText = "Ćwiczenie dodane pomyślnie!";
      } else {
          const errorText = await response.text();
          messageDiv.style.color = "red";
          messageDiv.innerText = "Błąd dodawania ćwiczenia: " + errorText;
      }
  } catch (error) {
      messageDiv.style.color = "red";
      messageDiv.innerText = "Błąd sieci: " + error.message;
  }
});

// Ładowanie ćwiczeń
async function loadExercises() {
  const authToken = getAuthToken();
  if (!authToken) {
      alert("Musisz być zalogowany, aby zobaczyć ćwiczenia.");
      return;
  }

  const response = await fetch('https://localhost:44300/api/exercises', {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${authToken}`
      }
  });

  const exercises = await response.json();
  const tableBody = document.getElementById('exercisesTable')?.getElementsByTagName('tbody')[0];

  if (tableBody) {
      exercises.forEach(exercise => {
          const row = tableBody.insertRow();
          row.innerHTML = `
              <td>${exercise.name}</td>
              <td>${exercise.category}</td>
              <td>${exercise.sets}</td>
              <td>${exercise.reps}</td>
              <td>${exercise.weight}</td>
              <td>${exercise.date}</td>
          `;
      });
  } else {
      console.error('Nie znaleziono elementu tableBody.');
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

  const today = new Date().toISOString().split('T')[0]; // Dzisiejsza data w formacie yyyy-mm-dd
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

  // Opcja resetowania filtrów
  document.getElementById("reset-filters").addEventListener("click", () => {
    selectedExerciseName = "";
    selectedDate = "";
    nameFilter.value = "";
    dateFilter.value = "";
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
      alert(`Błąd aktualizacji: ${text}`);
    }
  } catch (error) {
    console.error("Błąd aktualizacji ćwiczenia:", error);
    alert("Błąd podczas aktualizacji ćwiczenia!");
  }
}

function cancelEdit() {
  document.getElementById("editForm").style.display = 'none';
  editingExerciseId = null;
}

// Usuwanie ćwiczenia
async function deleteExercise(id) {
  if (confirm("Czy na pewno chcesz usunąć to ćwiczenie?")) {
    try {
      const response = await fetch(`${apiUrl}/exercises/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        alert("Ćwiczenie usunięte!");
        loadExercises();
      } else {
        const errorText = await response.text();
        alert("Błąd usuwania ćwiczenia: " + errorText);
      }
    } catch (error) {
      console.error("Błąd usuwania ćwiczenia:", error);
      alert("Błąd podczas usuwania ćwiczenia!");
    }
  }
}

// Inicjalizacja
async function init() {
  await loadExercises();
  populateExerciseNames();
  setupFilters();
}

init();
