function getAuthToken() {
    return sessionStorage.getItem('authToken');
}

function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.innerText = message;
    errorElement.style.display = 'block';
}

document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const token = getAuthToken();
    if (!token) {
        showError("Brak autoryzacji. Zaloguj się ponownie.");
        return;
    }

    try {
        const productData = {
            name: document.getElementById('productName').value,
            brand: document.getElementById('productBrand').value,
            barcode: document.getElementById('productBarcode').value,
            calories: parseFloat(document.getElementById('productCalories').value),
            carbs: parseFloat(document.getElementById('productCarbs').value) || 0,
            protein: parseFloat(document.getElementById('productProtein').value) || 0,
            fats: parseFloat(document.getElementById('productFats').value) || 0,
            salt: parseFloat(document.getElementById('productSalt').value) || 0,
            sugars: parseFloat(document.getElementById('productSugars').value) || 0,
            saturatedFat: parseFloat(document.getElementById('productSaturatedFat').value) || 0,
            consumedAt: new Date().toISOString()
        };

        const response = await fetch('https://localhost:44300/api/FoodApi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            throw new Error(`Błąd podczas dodawania produktu: ${response.status}`);
        }

        // Przekieruj z powrotem do listy produktów po udanym dodaniu
        window.location.href = 'foodList.html';

    } catch (error) {
        console.error("Błąd podczas dodawania produktu:", error);
        showError(`Nie udało się dodać produktu: ${error.message}`);
    }
});