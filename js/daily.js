document.addEventListener("DOMContentLoaded", async () => {  
    const today = new Date().getDay();
    let reminderMessage = "";

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

    const token = sessionStorage.getItem("authToken");  

    if (!token) {
        console.error("Brak tokenu JWT");
        return;
    }

    try {
        const response = await fetch("https://localhost:44300/api/exercises/DailyPlan", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token, 
            }
        });

        if (!response.ok) {
            throw new Error("Błąd serwera: " + response.status);
        }

        const data = await response.json();
        console.log(data);

        const exerciseList = document.getElementById("exerciseList");

        if (data.length === 0) {
            exerciseList.innerHTML = "<li class='list-group-item'>Brak ćwiczeń na dziś.</li>";
        } else {
            exerciseList.innerHTML = ""; 

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
