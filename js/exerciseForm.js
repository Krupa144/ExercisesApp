function getAuthToken() {
    return sessionStorage.getItem('authToken'); 
}
console.log(getAuthToken());


document.getElementById('exerciseForm').addEventListener('submit', async function (e) {
    e.preventDefault(); 

    const authToken = getAuthToken(); 
    const messageDiv = document.getElementById('exerciseMessage');
    messageDiv.classList.remove("d-none");

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

    if (isNaN(exerciseData.category) || isNaN(exerciseData.sets) || isNaN(exerciseData.reps) || isNaN(exerciseData.weight)) {
        messageDiv.style.color = "red";
        messageDiv.innerText = "Upewnij się, że wszystkie pola numeryczne są poprawnie wypełnione.";
        return;
    }

    try {
        const response = await fetch('https://localhost:44300/api/exercises', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}` 
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
