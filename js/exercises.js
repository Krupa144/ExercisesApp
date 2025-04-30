let allExercises = [];
let currentFilter = 'today';

const apiUrl = "https://localhost:44300";
let editingExerciseId = null;
const categoryId = parseInt(document.body.getAttribute("data-category"));


//kategorie
function categoryName(categoryValue) {
  switch (categoryValue) {
    case 0: return "FullBody";
    case 1: return "Push";
    case 2: return "Pull";
    case 3: return "Legs";
    default: return "Nieznana";
  }
}

//ladowanie cwiczeń
async function loadExercises() {
  try {
    const response = await fetch(`${apiUrl}/exercises`);
    const exercises = await response.json();
    allExercises = exercises.filter(ex => ex.category === categoryId);
    renderExercises();
  } catch (error) {
    console.error("Błąd ładowania ćwiczeń:", error);
  }
}


//generowanie cwiczen na podstawie daty 

function renderExercises() {
  const list = document.getElementById("exercises-list");
  list.innerHTML = "";

  let filtered = [...allExercises];

  if (currentFilter === "today") {
    const today = new Date().toISOString().split('T')[0];
    filtered = filtered.filter(ex => ex.date.split('T')[0] === today);
  } else if (currentFilter === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentFilter === "date") {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  if (filtered.length === 0) {
    list.innerHTML = `<li class="list-group-item text-muted">Brak ćwiczeń do wyświetlenia.</li>`;
    return;
  }


  //filtrowanie 
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

function applyFilter(filterType) {
  currentFilter = filterType;
  renderExercises();
}


//edytowanie cwiczen 
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

function cancelEdit() {
  document.getElementById("editForm").style.display = 'none';
}


//usuwanie 
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

window.onload = loadExercises;
