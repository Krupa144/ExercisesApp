
const API_URL = "https://localhost:44300/api/Weight";
const token = sessionStorage.getItem("authToken");

async function submitWeight() {
    const weightInput = document.getElementById("weightInput");
    const weight = parseFloat(weightInput.value);

    if (!weight || weight <= 0) {
        alert("Please enter a valid weight.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ weight })
        });

        if (res.ok) {
            alert("Weight saved!");
            weightInput.value = "";
            fetchTodayWeight();
        } else {
            const err = await res.text();
            alert("Error submitting weight: " + err);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Server error: " + error.message);
    }
}

async function fetchTodayWeight() {
    try {
        const res = await fetch(`${API_URL}/history`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            console.error("Failed to fetch history:", await res.text());
            document.getElementById("historyList").innerHTML = "<p>Error loading weight data.</p>";
            return;
        }

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
            document.getElementById("historyList").innerHTML = "<p>No weight data available.</p>";
            drawChart([]);
            return;
        }

        const todayKey = new Date().toISOString().split('T')[0];
        const todayData = data.find(w => new Date(w.recordedAt).toISOString().split('T')[0] === todayKey);

        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        const rangeStart = new Date(oneMonthAgo);
        const rangeEnd = new Date(oneMonthAgo);
        rangeStart.setDate(rangeStart.getDate() - 2);
        rangeEnd.setDate(rangeEnd.getDate() + 2);

        const monthAgoData = data.find(w => {
            const d = new Date(w.recordedAt);
            return d >= rangeStart && d <= rangeEnd;
        });

        let html = "";

        if (todayData) {
            html += `<p><strong>Today:</strong> ${new Date(todayData.recordedAt).toLocaleString()} — ${todayData.weight} kg</p>`;
        } else {
            html += "<p>No weight recorded today.</p>";
        }

        if (monthAgoData) {
            const base = todayData ? todayData.weight : 0;
            const diff = base - monthAgoData.weight;
            const diffText = diff > 0
                ? `You gained ${diff.toFixed(1)} kg since last month.`
                : diff < 0
                    ? `You lost ${Math.abs(diff).toFixed(1)} kg since last month.`
                    : "Your weight stayed the same.";

            html += `<p><strong>~30 days ago:</strong> ${new Date(monthAgoData.recordedAt).toLocaleDateString()} — ${monthAgoData.weight} kg</p>`;
            html += `<p class="fw-bold">${diffText}</p>`;
        } else {
            html += "<p>No data from around 30 days ago.</p>";
        }

        document.getElementById("historyList").innerHTML = html;

        drawChart(data);

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("historyList").innerHTML = "<p>Error loading weight data.</p>";
        drawChart([]);
    }
}

let weightChart = null;
function drawChart(data) {
    const ctx = document.getElementById("weightChart").getContext("2d");

    if (weightChart && typeof weightChart.destroy === "function") {
        weightChart.destroy();
    }
    const sorted = data.slice().sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
    const labels = sorted.map(w => new Date(w.recordedAt).toLocaleDateString());
    const weights = sorted.map(w => w.weight);

    weightChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Weight (kg)",
                data: weights,
                fill: false,
                borderColor: "rgba(75, 192, 192, 1)",
                tension: 0.2,
                pointRadius: 4,
                pointBackgroundColor: "rgba(75, 192, 192, 1)"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: "Weight Progress Over Time"
                }
            },
            scales: {
                x: {
                    title: { display: true, text: "Date" }
                },
                y: {
                    title: { display: true, text: "Weight (kg)" }
                }
            }
        }
    });
}

if (token) {
    fetchTodayWeight();
} else {
    alert("You are not logged in.");
}
