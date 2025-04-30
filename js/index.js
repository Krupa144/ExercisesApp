const apiUrl = "https://localhost:44300";

function categoryName(categoryValue) {
  switch (categoryValue) {
    case 0: return "FullBody";
    case 1: return "Push";
    case 2: return "Pull";
    case 3: return "Legs";
    default: return "Nieznana";
  }
}

async function addExercise() {
  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  const weight = document.getElementById("weight").value;

  const sets = document.getElementById("sets").value;
  const reps = document.getElementById("reps").value;

  const exercise = {
    name: name,
    category: parseInt(category),
    date: date,
    weight: weight ? parseInt(weight) :0,
    sets: sets ? parseInt(sets) : 0,
    reps: reps ? parseInt(reps) : 0
  };

  try {
    const response = await fetch(`${apiUrl}/exercises`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(exercise)
    });

    if (response.ok) {
      alert("Ćwiczenie dodane!");
      document.getElementById("name").value = "";
      document.getElementById("sets").value = "";
      document.getElementById("reps").value = "";
      document.getElementById("weight").value = "";
      document.getElementById("date").value = "";
    } else {
      const text = await response.text();
      alert("Błąd: " + text);
    }
  } catch (error) {
    console.error("Błąd dodawania:", error);
    alert("Wystąpił błąd podczas dodawania ćwiczenia!");
  }
}
