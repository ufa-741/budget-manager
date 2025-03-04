
const expenseForm = document.getElementById("expense-form");
const expenseName = document.getElementById("expense-name");
const expenseAmount = document.getElementById("expense-amount");
const expenseCategory = document.getElementById("expense-category");
const expenseList = document.getElementById("expense-ul");
const totalAmount = document.getElementById("total-amount");
const expenseDate = document.getElementById("expense-date");

const incomeInput = document.getElementById("income-input");
const setIncomeBtn = document.getElementById("set-income-btn");
const remainingBalance = document.getElementById("remaining-balance");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("register-btn");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const userStatus = document.getElementById("user-status");

const filterMonth = document.getElementById("filter-month");

let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser") || null;
let expenses = [];
let totalIncome = 0;
let expenseChart;


function loadExpenses() {
    expenses = currentUser
        ? JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || []
        : JSON.parse(sessionStorage.getItem("expenses_temp")) || [];
}

function loadIncome() {
    totalIncome = currentUser
        ? parseFloat(localStorage.getItem(`income_${currentUser}`)) || 0
        : parseFloat(sessionStorage.getItem("income_temp")) || 0;
}


function saveExpenses() {
    if (currentUser) {
        localStorage.setItem(`expenses_${currentUser}`, JSON.stringify(expenses));
    } else {
        sessionStorage.setItem("expenses_temp", JSON.stringify(expenses));
    }
}

function saveIncome() {
    if (currentUser) {
        localStorage.setItem(`income_${currentUser}`, totalIncome);
    } else {
        sessionStorage.setItem("income_temp", totalIncome);
    }
}


function updateAuthUI() {
    if (currentUser) {
        userStatus.textContent = `✅ Connecté en tant que : ${currentUser}`;
        logoutBtn.style.display = "block";
    } else {
        userStatus.textContent = "";
        logoutBtn.style.display = "none";
    }
}


registerBtn.addEventListener("click", function () {
    let username = usernameInput.value.trim();
    let password = passwordInput.value.trim();

    if (!username || !password) {
        alert("Veuillez entrer un nom d'utilisateur et un mot de passe !");
        return;
    }

    if (users[username]) {
        alert("Ce nom d'utilisateur existe déjà !");
        return;
    }

    users[username] = password;
    localStorage.setItem("users", JSON.stringify(users));
    alert("Compte créé avec succès !");
});


loginBtn.addEventListener("click", function () {
    let username = usernameInput.value.trim();
    let password = passwordInput.value.trim();

    if (users[username] && users[username] === password) {
        currentUser = username;
        localStorage.setItem("currentUser", currentUser);
        alert("Connexion réussie !");
        location.reload();
    } else {
        alert("Identifiants incorrects !");
    }
});


logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    currentUser = null;
    alert("Vous avez été déconnecté !");
    location.reload();
});


setIncomeBtn.addEventListener("click", function () {
    totalIncome = parseFloat(incomeInput.value) || 0;
    saveIncome();
    updateData();
});


expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = expenseName.value.trim();
    const amount = parseFloat(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value;

    if (!name || isNaN(amount) || amount <= 0) return;

    expenses.push({ name, amount, category, date });
    saveExpenses();
    updateData();
    expenseForm.reset();
});


function updateExpenseList() {
    expenseList.innerHTML = "";

    let filteredExpenses = [...expenses];

    
    if (filterMonth.value) {
        const selectedMonth = filterMonth.value; // Format YYYY-MM
        filteredExpenses = filteredExpenses.filter(expense => expense.date.startsWith(selectedMonth));
    }

   
    filteredExpenses.forEach((expense, index) => {
        const li = document.createElement("li");
        li.innerHTML = `${expense.name} - ${expense.amount.toFixed(2)}€ (${expense.date}) 
                        <button onclick="deleteExpense(${index})">❌ Supprimer</button>`;
        expenseList.appendChild(li);
    });
}


function deleteExpense(index) {
    expenses.splice(index, 1);
    saveExpenses();
    updateData();
}


function updateRemainingBalance() {
    let totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    let balance = totalIncome - totalExpenses;
    remainingBalance.textContent = balance.toFixed(2) + " €";
}


function updateChart() {
    const ctx = document.getElementById("expenseChart").getContext("2d");

    let monthlyTotals = {};
    expenses.forEach(expense => {
        let month = expense.date.slice(0, 7); // Prend YYYY-MM
        monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
    });

    let months = Object.keys(monthlyTotals);
    let amounts = Object.values(monthlyTotals);

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: months,
            datasets: [{
                label: "Dépenses mensuelles (€)",
                data: amounts,
                backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"],
                borderColor: "#ffffff",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}


function updateData() {
    updateExpenseList();
    updateTotalAmount();
    updateRemainingBalance();
    updateChart();
}


function updateTotalAmount() {
    let total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalAmount.textContent = total.toFixed(2) + " €";
}


filterMonth.addEventListener("change", updateExpenseList);


loadExpenses();
loadIncome();
updateData();
updateAuthUI();
