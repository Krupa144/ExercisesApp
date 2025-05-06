function getAuthToken() {
    return sessionStorage.getItem('authToken'); 
}

let currentProduct = null;

async function searchProduct() {
    const barcode = document.getElementById('barcodeInput').value.trim();
    if (!barcode) {
        alert('Proszę wprowadzić kod kreskowy');
        return;
    }

    try {
        const apiUrl = `https://localhost:44300/api/FoodApi/barcode/${barcode}`;
        const res = await fetch(apiUrl, {
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(`Błąd serwera: ${error}`);
        }

        const data = await res.json();
        console.log("Received data:", data); // Debugging line

        if (!data || !data.data) {
            throw new Error('Produkt nie znaleziony');
        }

        currentProduct = data.data;
        updateProductInfo(currentProduct);
    } catch (err) {
        alert(`Błąd: ${err.message}`);
        console.error('Błąd:', err);
        document.getElementById('result').style.display = 'none';
    }
}

function updateProductInfo(data) {
    document.getElementById('name').textContent = data.name || 'Brak danych';
    document.getElementById('brand').textContent = data.brand || 'Brak danych';
    document.getElementById('calories').textContent = data.calories || '0';
    document.getElementById('protein').textContent = data.protein || '0';
    document.getElementById('carbs').textContent = data.carbs || '0';
    document.getElementById('fats').textContent = data.fats || '0';
    document.getElementById('sugars').textContent = data.sugars || '0';
    document.getElementById('saturatedFat').textContent = data.saturatedFat || '0';
    document.getElementById('salt').textContent = data.salt || '0';
    document.getElementById('result').style.display = 'block';
}

async function saveProduct() {
    const token = getAuthToken(); 

    if (!token) {
        alert("Brak tokena. Zaloguj się.");
        return;
    }

    if (!currentProduct) {
        alert("Brak produktu do zapisania.");
        return;
    }

    console.log("Saving product:", currentProduct); // Debugging line

    try {
        document.getElementById('result').innerHTML += '<p>Zapisywanie...</p>';

        const response = await fetch("https://localhost:44300/api/FoodApi", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(currentProduct)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Błąd serwera: "${errorText}"`);
        }

        const result = await response.json();
        console.log("Saved product:", result); // Debugging line
        alert("Produkt zapisany!");
        resetForm();
        document.getElementById('result').innerHTML = '';
    } catch (err) {
        console.error("Błąd:", err);
        alert(`Nie udało się zapisać produktu: ${err.message}`);
        document.getElementById('result').innerHTML = '';
    }
}

function resetForm() {
    currentProduct = null;
    document.getElementById('result').style.display = 'none';
    document.getElementById('barcodeInput').value = '';
}