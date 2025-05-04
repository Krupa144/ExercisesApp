let selectedExerciseName = "";
let selectedDate = "";
const apiUrl = "https://localhost:44300";
let editingExerciseId = null;
let allExercises = [];

function categoryName(categoryValue) {
  switch (categoryValue) {
    case 0: return "FullBody";
    case 1: return "Push";
    case 2: return "Pull";
    case 3: return "Legs";
    default: return "Nieznana";
  }
}

function getAuthToken() {
  return sessionStorage.getItem('authToken'); 
}

async function loadExercises() {
  const authToken = getAuthToken();
  if (!authToken) {
    alert("Musisz być zalogowany, aby zobaczyć ćwiczenia.");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/api/exercises`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) {
      throw new Error("Nie udało się pobrać ćwiczeń");
    }

    const exercises = await response.json();
    allExercises = exercises;

    const categoryFilter = document.body.getAttribute('data-category'); 
    const filteredExercises = exercises.filter(exercise => {
      return categoryFilter === "0" || exercise.category === parseInt(categoryFilter); 
    });

    const tableBody = document.getElementById('exercisesTable')?.getElementsByTagName('tbody')[0];

    if (tableBody) {
      tableBody.innerHTML = '';
      filteredExercises.forEach(exercise => {
        const row = tableBody.insertRow();
        row.innerHTML = ` 
          <td>${exercise.name}</td>
          <td>${categoryName(exercise.category)}</td>
          <td>${exercise.sets}</td>
          <td>${exercise.reps}</td>
          <td>${exercise.weight}</td>
          <td>${exercise.date.split('T')[0]}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editExercise(${exercise.id})">Edytuj</button>
            <button class="btn btn-sm btn-danger" onclick="deleteExercise(${exercise.id})">Usuń</button>
          </td>
        `;
      });
    }
  } catch (error) {
    console.error("Błąd ładowania ćwiczeń:", error);
    alert("Nie udało się załadować ćwiczeń.");
  }
}

async function editExercise(id) {
  const token = getAuthToken();
  try {
    const response = await fetch(`${apiUrl}/api/exercises/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Błąd: ${response.statusText}`);
    }

    const exercise = await response.json();
    document.getElementById("edit-name").value = exercise.name;
    document.getElementById("edit-sets").value = exercise.sets;
    document.getElementById("edit-reps").value = exercise.reps;
    document.getElementById("edit-weight").value = exercise.weight;
    document.getElementById("edit-date").value = exercise.date.split('T')[0];
    editingExerciseId = id;

    document.getElementById("editForm").style.display = 'block';
  } catch (error) {
    console.error("Błąd ładowania ćwiczenia:", error);
    alert("Błąd podczas edytowania ćwiczenia!");
  }
}

async function updateExercise() {
  const token = getAuthToken();
  const userId = sessionStorage.getItem("userId");
  if (!userId) {
    alert("Brakuje informacji o użytkowniku. Zaloguj się ponownie.");
    return;
  }

  const updated = {
    id: editingExerciseId,
    name: document.getElementById("edit-name").value,
    sets: parseInt(document.getElementById("edit-sets").value),
    reps: parseInt(document.getElementById("edit-reps").value),
    weight: parseFloat(document.getElementById("edit-weight").value),
    date: document.getElementById("edit-date").value,
    userId: userId,
    user: null 
  };

  try {
    const response = await fetch(`${apiUrl}/api/exercises/${editingExerciseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
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

async function deleteExercise(id) {
  const token = getAuthToken();
  if (confirm("Czy na pewno chcesz usunąć to ćwiczenie?")) {
    try {
      const response = await fetch(`${apiUrl}/api/exercises/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
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


function filterExercises() {
  const list = document.getElementById("exercises-list");
  if (!list) return;

  list.innerHTML = ""; 

  const categoryFilter = document.body.getAttribute('data-category');
  const today = new Date().toISOString().split('T')[0];

  const filtered = allExercises.filter(exercise => {
    const exerciseDate = exercise.date.split('T')[0];
    return (
      (categoryFilter ? exercise.category == categoryFilter : true) && 
      (selectedExerciseName ? exercise.name.includes(selectedExerciseName) : true) && 
      (selectedDate ? exerciseDate === selectedDate : true) && 
      (selectedDate || exerciseDate === today) 
    );
  });

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
      <button class="btn btn-danger" onclick="deleteExercise(${ex.id})">Usuń</button>
    `;
    list.appendChild(li);
  });
}

document.getElementById("exercise-date-filter")?.addEventListener("input", function () {
  selectedDate = this.value;
  filterExercises();
});

document.getElementById("exercise-name-filter")?.addEventListener("input", function () {
  selectedExerciseName = this.value;
  filterExercises();
});

loadExercises();
