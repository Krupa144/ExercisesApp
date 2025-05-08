document.addEventListener("DOMContentLoaded", async () => {  // Dodaj async tutaj
    const today = new Date().getDay();
    let reminderMessage = "";

    // Ustawienie wiadomości na podstawie dnia tygodnia
    switch (today) {
        case 0: 
            reminderMessage = "today is rest day";
            break;
        case 1: 
            reminderMessage = "Fullbody";
            break;
        case 2: 
            reminderMessage = "Push";
            break;
        case 3: 
            reminderMessage = "Pull";
            break;
        case 4:
            reminderMessage = "Legs";
            break;
        case 5: 
            reminderMessage = "Fullbody";
            break;
        case 6: 
            reminderMessage = "today is rest day";
            break;
        default:
            reminderMessage = "today is rest day";
            break;
    }

    const reminderElement = document.getElementById("reminderMessage");
    reminderElement.textContent = reminderMessage;

    // Pobranie tokenu JWT z sessionStorage
    const token = sessionStorage.getItem("authToken");  // Używamy sessionStorage

    if (!token) {
        console.error("Brak tokenu JWT");
        return;
    }

    // Wykonanie zapytania do API
    try {
        const response = await fetch("https://localhost:44300/api/exercises/DailyPlan", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token, // Wysyłanie tokenu JWT w nagłówku
            }
        });

        if (!response.ok) {
            throw new Error("Błąd serwera: " + response.status);
        }

        const data = await response.json();
        console.log(data);

        const exerciseList = document.getElementById("exerciseList");

        // Sprawdzanie, czy są dane do wyświetlenia
        if (data.length === 0) {
            exerciseList.innerHTML = "<li class='list-group-item'>Brak ćwiczeń na dziś.</li>";
        } else {
            exerciseList.innerHTML = ""; // Czyszczenie listy przed dodaniem nowych elementów

            // Tworzenie elementów listy dla każdego ćwiczenia
            data.forEach(exercise => {
                const item = document.createElement("li");
                item.className = "list-group-item";
                item.textContent = `Exercise: ${exercise.name} - ${exercise.sets}x${exercise.reps} @ ${exercise.weight}kg`;
                exerciseList.appendChild(item);
            });
        }
    } catch (error) {
        console.error("Błąd:", error);
    }
});
