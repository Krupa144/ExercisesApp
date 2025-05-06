    // Funkcja do pobierania tokena JWT
    function getAuthToken() {
        return sessionStorage.getItem('authToken');
    }

    async function loadProducts() {
        const token = getAuthToken();

        if (!token) {
            document.getElementById('error').innerText = "Brak autoryzacji. Zaloguj się ponownie.";
            return;
        }

        try {
            // Ustawienie daty dzisiejszej
            const today = new Date().toISOString().split('T')[0]; // format: yyyy-mm-dd
            console.log("Today:", today); // Debugging line

            const response = await fetch(`https://localhost:44300/api/FoodApi`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Brak autoryzacji lub błąd tokena JWT.");
                } else {
                    throw new Error(`Błąd serwera: ${response.status}`);
                }
            }

            const products = await response.json();
            console.log("Received products:", products); // Debugging line
            const list = document.getElementById('productsList');
            list.innerHTML = '';

            if (products.length === 0) {
                list.innerHTML = '<p>Brak produktów na dzisiaj.</p>';
                return;
            }

            products.forEach(product => {
                const item = document.createElement('div');
                item.className = 'product-item';

                // Wyświetlanie danych produktu
                item.innerHTML = `
                    <strong>${product.name}</strong><br>
                    ${product.calories} kcal<br>
                    Węglowodany: ${product.carbs}g<br>
                    Białko: ${product.protein}g<br>
                    Tłuszcz: ${product.fats}g<br>
                    Sód: ${product.salt}g
                `;

                list.appendChild(item);
            });

        } catch (error) {
            console.error("Błąd podczas ładowania produktów:", error);
            document.getElementById('error').innerText = "Nie udało się załadować produktów. Sprawdź połączenie i autoryzację.";
        }
    }

    document.getElementById('logoutBtn').addEventListener('click', function () {
        sessionStorage.removeItem('authToken');
        window.location.href = 'login.html';
    });

    document.getElementById('viewProfileBtn').addEventListener('click', function () {
        window.location.href = 'start.html';
    });

    // Automatyczne ładowanie produktów po załadowaniu strony
    window.onload = loadProducts;