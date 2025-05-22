document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const phoneNumber = document.getElementById('phoneNumber').value.trim();

    const messageDiv = document.getElementById('registerMessage');
    messageDiv.classList.remove('d-none');
    messageDiv.style.color = "red";

    if (!firstName || !email || !password || !phoneNumber) {
        messageDiv.innerText = "Wszystkie pola są wymagane!";
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        messageDiv.innerText = "Niepoprawny format adresu e-mail!";
        return;
    }

    const phoneRegex = /^[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
        messageDiv.innerText = "Numer telefonu musi zawierać 9 cyfr!";
        return;
    }

    const registerData = {
        email,
        password,
        phoneNumber,
        firstName
    };

    try {
        const response = await fetch('https://localhost:44300/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.style.color = "green";
            messageDiv.innerText = "Rejestracja zakończona sukcesem! Przekierowywanie...";
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            messageDiv.innerText = result.message || "Wystąpił błąd podczas rejestracji.";
        }
    } catch (error) {
        console.error("Błąd połączenia:", error);
        messageDiv.innerText = "Wystąpił problem z połączeniem. Spróbuj ponownie później.";
    }
});
