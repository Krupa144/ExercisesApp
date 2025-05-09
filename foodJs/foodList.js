function getAuthToken() {
    return sessionStorage.getItem('authToken');
}

let macrosChart = null;
let editModal = null;

document.addEventListener('DOMContentLoaded', function() {
    editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    loadProducts();
});

async function loadProducts() {
    const token = getAuthToken();
    const errorElement = document.getElementById('error');
    errorElement.style.display = 'none';

    if (!token) {
        showError("Authorization missing. Please log in again.");
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
                throw new Error("Authorization or JWT token error.");
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
        }

        const products = await response.json();
        displayProducts(products);
        updateMacrosChart(products);

    } catch (error) {
        console.error("Error loading products:", error);
        showError(`Failed to load products: ${error.message}`);
    }
}

function displayProducts(products) {
    const list = document.getElementById('productsList');
    list.innerHTML = '';

    if (products.length === 0) {
        list.innerHTML = '<div class="col-12"><p class="text-muted">No products for today.</p></div>';
        return;
    }

    products.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        const card = document.createElement('div');
        card.className = 'card product-card mb-3';
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        cardBody.innerHTML = `
            <h5 class="card-title">${product.name}</h5>
            ${product.brand ? `<p class="card-subtitle text-muted mb-2">${product.brand}</p>` : ''}
            <div class="mb-2">
                <span class="badge bg-primary nutrition-badge">${product.calories} kcal</span>
                ${product.protein ? `<span class="badge bg-success nutrition-badge">P: ${product.protein}g</span>` : ''}
                ${product.carbs ? `<span class="badge bg-warning nutrition-badge">C: ${product.carbs}g</span>` : ''}
                ${product.fats ? `<span class="badge bg-danger nutrition-badge">F: ${product.fats}g</span>` : ''}
            </div>
            ${product.consumedAt ? `<p class="card-text small text-muted">Consumed: ${new Date(product.consumedAt).toLocaleTimeString()}</p>` : ''}
        `;
        
        const buttons = document.createElement('div');
        buttons.className = 'action-buttons mt-3';
        buttons.innerHTML = `
            <button class="btn btn-sm btn-outline-primary edit-btn me-2" data-id="${product.id}">
                <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${product.id}">
                <i class="bi bi-trash"></i> Delete
            </button>
        `;
        cardBody.appendChild(buttons);
        
        card.appendChild(cardBody);
        col.appendChild(card);
        list.appendChild(col);
    });

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

function updateMacrosChart(products) {
    const ctx = document.getElementById('macrosChart').getContext('2d');
    
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

    if (macrosChart) {
        macrosChart.data.datasets[0].data = [totals.protein, totals.carbs, totals.fats];
        macrosChart.update();
        updateMacrosSummary(totals);
        return;
    }

    macrosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein (g)', 'Carbs (g)', 'Fats (g)'],
            datasets: [{
                data: [totals.protein, totals.carbs, totals.fats],
                backgroundColor: [
                    '#00D97E',
                    '#5F33E0',
                    '#FF3D57'
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
                        boxWidth: 7,
                        padding: 7,
                        font: {
                            size: 19
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
            cutout: '75%',
            radius: '30%'
        }
    });

    updateMacrosSummary(totals);
}

function updateMacrosSummary(totals) {
    const chartContainer = document.querySelector('#macrosChart').parentElement;
    
    let summaryElement = chartContainer.querySelector('.macros-summary');
    
    if (!summaryElement) {
        summaryElement = document.createElement('div');
        summaryElement.className = 'macros-summary text-center mt-3';
        chartContainer.appendChild(summaryElement);
    }
    
    summaryElement.innerHTML = `
        <p class="mb-1"><strong>Total Calories:</strong> ${totals.calories} kcal</p>
        <p class="mb-1"><strong>P:</strong> ${totals.protein}g | <strong>C:</strong> ${totals.carbs}g | <strong>F:</strong> ${totals.fats}g</p>
    `;
}

async function openEditModal(productId) {
    const token = getAuthToken();
    if (!token) {
        showError("Authorization missing. Please log in again.");
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error retrieving product: ${response.status}`);
        }

        const product = await response.json();
        
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
        console.error("Error opening edit modal:", error);
        showError(`Failed to load product for editing: ${error.message}`);
    }
}

document.getElementById('saveEditBtn').addEventListener('click', async function() {
    const token = getAuthToken();
    const productId = document.getElementById('editProductId').value;
    
    if (!token || !productId) {
        showError("Authorization missing or no product to edit.");
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
            throw new Error(`Error updating product: ${response.status}`);
        }

        editModal.hide();
        loadProducts();

    } catch (error) {
        console.error("Error updating product:", error);
        showError(`Failed to update product: ${error.message}`);
    }
});

async function deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    const token = getAuthToken();
    if (!token) {
        showError("Authorization missing. Please log in again.");
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
            throw new Error(`Error deleting product: ${response.status}`);
        }

        loadProducts();

    } catch (error) {
        console.error("Error deleting product:", error);
        showError(`Failed to delete product: ${error.message}`);
    }
}

function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.innerText = message;
    errorElement.style.display = 'block';
}

const apiBaseUrl = 'https://localhost:44300/api/FoodApi';
