// Funkcja do pobierania tokena JWT
function getAuthToken() {
    return sessionStorage.getItem('authToken');
}

let macrosChart = null;
let editModal = null;

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    loadProducts();
});

// Ładowanie produktów
async function loadProducts() {
    const token = getAuthToken();
    const errorElement = document.getElementById('error');
    errorElement.style.display = 'none';

    if (!token) {
        showError("Brak autoryzacji. Zaloguj się ponownie.");
        return;
    }

    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`https://localhost:44300/api/FoodApi/by-date?date=${today}`, {
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
        displayProducts(products);
        updateMacrosChart(products);

    } catch (error) {
        console.error("Błąd podczas ładowania produktów:", error);
        showError(`Nie udało się załadować produktów: ${error.message}`);
    }
}

// Wyświetlanie produktów
function displayProducts(products) {
    const list = document.getElementById('productsList');
    list.innerHTML = '';

    if (products.length === 0) {
        list.innerHTML = '<div class="col-12"><p class="text-muted">Brak produktów na dzisiaj.</p></div>';
        return;
    }

    products.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        const card = document.createElement('div');
        card.className = 'card product-card mb-3';
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        // Informacje o produkcie
        cardBody.innerHTML = `
            <h5 class="card-title">${product.name}</h5>
            ${product.brand ? `<p class="card-subtitle text-muted mb-2">${product.brand}</p>` : ''}
            <div class="mb-2">
                <span class="badge bg-primary nutrition-badge">${product.calories} kcal</span>
                ${product.protein ? `<span class="badge bg-success nutrition-badge">B: ${product.protein}g</span>` : ''}
                ${product.carbs ? `<span class="badge bg-warning nutrition-badge">W: ${product.carbs}g</span>` : ''}
                ${product.fats ? `<span class="badge bg-danger nutrition-badge">T: ${product.fats}g</span>` : ''}
            </div>
            ${product.consumedAt ? `<p class="card-text small text-muted">Spożyto: ${new Date(product.consumedAt).toLocaleTimeString()}</p>` : ''}
        `;
        
        // Przyciski akcji
        const buttons = document.createElement('div');
        buttons.className = 'action-buttons mt-3';
        buttons.innerHTML = `
            <button class="btn btn-sm btn-outline-primary edit-btn me-2" data-id="${product.id}">
                <i class="bi bi-pencil"></i> Edytuj
            </button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${product.id}">
                <i class="bi bi-trash"></i> Usuń
            </button>
        `;
        cardBody.appendChild(buttons);
        
        card.appendChild(cardBody);
        col.appendChild(card);
        list.appendChild(col);
    });

    // Dodanie event listenerów do przycisków
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            openEditModal(this.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteProduct(this.getAttribute('data-id'));
        });
    });
}

// Aktualizacja wykresu makroskładników
function updateMacrosChart(products) {
    const ctx = document.getElementById('macrosChart').getContext('2d');
    
    // Oblicz sumy makroskładników
    const totals = {
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0
    };

    products.forEach(product => {
        totals.protein += product.protein || 0;
        totals.carbs += product.carbs || 0;
        totals.fats += product.fats || 0;
        totals.calories += product.calories || 0;
    });

    // Jeśli wykres już istnieje, zaktualizuj dane
    if (macrosChart) {
        macrosChart.data.datasets[0].data = [totals.protein, totals.carbs, totals.fats];
        macrosChart.update();
        
        // Aktualizuj podsumowanie
        updateMacrosSummary(totals);
        return;
    }

    // Stwórz nowy wykres
    macrosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Białko (g)', 'Węglowodany (g)', 'Tłuszcze (g)'],
            datasets: [{
                data: [totals.protein, totals.carbs, totals.fats],
                backgroundColor: [
                    '#00D97E', // zielony - białko
                    '#5F33E0', // fioletowy - węglowodany
                    '#FF3D57'  // czerwony - tłuszcze
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 7, // Mniejsze kwadraty legendy
                        padding: 7, // Mniejszy padding
                        font: {
                            size: 19 // Mniejsza czcionka
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}g`;
                        }
                    }
                }
                
            },
            cutout: '75%', // Większy otwór w środku
            radius: '30%' // Mniejszy ogólny rozmiar wykresu
        }
    });

    // Dodaj podsumowanie
    updateMacrosSummary(totals);
}

// Aktualizacja podsumowania makroskładników
function updateMacrosSummary(totals) {
    const chartContainer = document.querySelector('#macrosChart').parentElement;
    
    // Sprawdź czy podsumowanie już istnieje
    let summaryElement = chartContainer.querySelector('.macros-summary');
    
    if (!summaryElement) {
        summaryElement = document.createElement('div');
        summaryElement.className = 'macros-summary text-center mt-3';
        chartContainer.appendChild(summaryElement);
    }
    
    summaryElement.innerHTML = `
        <p class="mb-1"><strong>Łącznie kalorii:</strong> ${totals.calories} kcal</p>
        <p class="mb-1"><strong>B:</strong> ${totals.protein}g | <strong>W:</strong> ${totals.carbs}g | <strong>T:</strong> ${totals.fats}g</p>
    `;
}

// Otwarcie modala do edycji
async function openEditModal(productId) {
    const token = getAuthToken();
    if (!token) {
        showError("Brak autoryzacji. Zaloguj się ponownie.");
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Błąd podczas pobierania produktu: ${response.status}`);
        }

        const product = await response.json();
        
        // Wypełnij formularz edycji
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductBrand').value = product.brand || '';
        document.getElementById('editProductCalories').value = product.calories || '';
        document.getElementById('editProductCarbs').value = product.carbs || '';
        document.getElementById('editProductProtein').value = product.protein || '';
        document.getElementById('editProductFats').value = product.fats || '';
        document.getElementById('editProductSalt').value = product.salt || '';
        document.getElementById('editProductBarcode').value = product.barcode || '';

        editModal.show();

    } catch (error) {
        console.error("Błąd podczas otwierania edycji:", error);
        showError(`Nie udało się załadować produktu do edycji: ${error.message}`);
    }
}

// Zapisz edytowany produkt
document.getElementById('saveEditBtn').addEventListener('click', async function() {
    const token = getAuthToken();
    const productId = document.getElementById('editProductId').value;
    
    if (!token || !productId) {
        showError("Brak autoryzacji lub produktu do edycji.");
        return;
    }

    try {
        const productData = {
            id: parseInt(productId),
            name: document.getElementById('editProductName').value,
            brand: document.getElementById('editProductBrand').value,
            barcode: document.getElementById('editProductBarcode').value,
            calories: parseFloat(document.getElementById('editProductCalories').value),
            carbs: parseFloat(document.getElementById('editProductCarbs').value) || 0,
            protein: parseFloat(document.getElementById('editProductProtein').value) || 0,
            fats: parseFloat(document.getElementById('editProductFats').value) || 0,
            salt: parseFloat(document.getElementById('editProductSalt').value) || 0
        };

        const response = await fetch(`${apiBaseUrl}/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            throw new Error(`Błąd podczas aktualizacji produktu: ${response.status}`);
        }

        editModal.hide();
        loadProducts();

    } catch (error) {
        console.error("Błąd podczas aktualizacji produktu:", error);
        showError(`Nie udało się zaktualizować produktu: ${error.message}`);
    }
});

// Usuwanie produktu
async function deleteProduct(productId) {
    if (!confirm("Czy na pewno chcesz usunąć ten produkt?")) {
        return;
    }

    const token = getAuthToken();
    if (!token) {
        showError("Brak autoryzacji. Zaloguj się ponownie.");
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Błąd podczas usuwania produktu: ${response.status}`);
        }

        loadProducts();

    } catch (error) {
        console.error("Błąd podczas usuwania produktu:", error);
        showError(`Nie udało się usunąć produktu: ${error.message}`);
    }
}

// Wyświetlanie błędów
function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.innerText = message;
    errorElement.style.display = 'block';
}

// Stała z adresem API
const apiBaseUrl = 'https://localhost:44300/api/FoodApi';