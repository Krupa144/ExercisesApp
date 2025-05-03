// auth.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken'); // Pobierz token z localStorage (lub sessionStorage)
    const userNameElement = document.getElementById('userName');
    const profileLink = document.getElementById('profileLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (token) {
        // Jeśli token istnieje, użytkownik jest zalogowany
        // Możesz również pobrać dane użytkownika z API, aby uzyskać np. imię
        const user = JSON.parse(localStorage.getItem('userData')); // Pobierz dane użytkownika z localStorage
        userNameElement.textContent = `Witaj, ${user.firstName}`; // Zakładając, że w userData masz firstName
        profileLink.href = './profile.html'; // Możesz ustawić link do profilu użytkownika
        logoutLink.style.display = 'inline'; // Pokaż opcję wylogowania
        document.getElementById('navLinks').addEventListener('click', handleLogout); // Dodaj nasłuchiwanie na kliknięcie wylogowania
    } else {
        // Jeśli token nie istnieje, przekieruj na stronę logowania
        window.location.href = './login.html';
    }
});

// Funkcja wylogowania
function handleLogout() {
    localStorage.removeItem('authToken'); // Usuń token z localStorage
    localStorage.removeItem('userData'); // Usuń dane użytkownika
    window.location.href = './login.html'; // Przekieruj do strony logowania
}
