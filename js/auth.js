function getAuthToken() {
    return sessionStorage.getItem('authToken'); 
}

if (getAuthToken()) {
    document.getElementById('loginFormDiv').style.display = 'none';
    document.getElementById('mainPageDiv').style.display = 'block';
}

// Funkcja logowania
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('loginMessage');

    try {
        const response = await fetch('https://localhost:44300/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('authToken', data.token); 

            document.getElementById('loginFormDiv').style.display = 'none';
            document.getElementById('mainPageDiv').style.display = 'block';
        } else {
            const errorText = await response.text();
            messageDiv.style.color = "red";
            messageDiv.innerText = "Błąd logowania: " + errorText;
        }
    } catch (error) {
        messageDiv.style.color = "red";
        messageDiv.innerText = "Błąd sieci: " + error.message;
    }
});

document.getElementById('logoutBtn').addEventListener('click', function () {
    sessionStorage.removeItem('authToken'); 
    window.location.href = 'login.html'; 
});

document.getElementById('viewProfileBtn').addEventListener('click', function () {
    window.location.href = 'start.html'; 
});
