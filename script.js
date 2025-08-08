const formFields = {
  desc: document.getElementById('description'),
  amt: document.getElementById('amount'),
  date: document.getElementById('date'),
  cat: document.getElementById('category'),
};

const list = document.getElementById('expense-list');
const totalDisplay = document.getElementById('total');
const search = document.getElementById('search');
const filterCat = document.getElementById('filter-category');
const filterMonth = document.getElementById('filter-month');
const exportBtn = document.getElementById('export-btn');
const categoryChartEl = document.getElementById('categoryChart');
const monthlyChartEl = document.getElementById('monthlyChart');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let editIndex = -1;

document.getElementById('add-btn').addEventListener('click', () => {
  const desc = formFields.desc.value.trim();
  const amt = parseFloat(formFields.amt.value);
  const date = formFields.date.value;
  const cat = formFields.cat.value;

  if (!desc || !amt || !date) return alert("Fill all fields");

  const newExpense = { desc, amt, date, cat };
  if (editIndex === -1) expenses.push(newExpense);
  else {
    expenses[editIndex] = newExpense;
    editIndex = -1;
  }

  saveAndRender();
  formFields.desc.value = formFields.amt.value = formFields.date.value = '';
});

function saveAndRender() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();
  updateTotal();
  updateCharts();
}

function renderExpenses() {
  list.innerHTML = '';
  const filtered = expenses.filter(e => {
    return (
      e.desc.toLowerCase().includes(search.value.toLowerCase()) &&
      (filterCat.value === '' || e.cat === filterCat.value) &&
      (!filterMonth.value || e.date.startsWith(filterMonth.value))
    );
  });

  filtered.forEach((e, i) => {
    const item = document.createElement('div');
    item.className = 'expense';
    item.innerHTML = `
      <span>
        <strong>${e.desc}</strong><br>
        ₹${e.amt} • ${e.cat} • ${e.date}
      </span>
      <div class="expense-buttons">
        <button onclick="editExpense(${i})">✏️</button>
        <button onclick="deleteExpense(${i})">❌</button>
      </div>
    `;
    list.appendChild(item);
  });
}

function editExpense(i) {
  const e = expenses[i];
  formFields.desc.value = e.desc;
  formFields.amt.value = e.amt;
  formFields.date.value = e.date;
  formFields.cat.value = e.cat;
  editIndex = i;
}

function deleteExpense(i) {
  if (confirm('Delete this expense?')) {
    expenses.splice(i, 1);
    saveAndRender();
  }
}

function updateTotal() {
  const total = expenses.reduce((sum, e) => sum + e.amt, 0);
  totalDisplay.textContent = total.toFixed(2);
}

search.addEventListener('input', renderExpenses);
filterCat.addEventListener('change', renderExpenses);
filterMonth.addEventListener('change', renderExpenses);

exportBtn.addEventListener('click', () => {
  const csv = ['Description,Amount,Date,Category'];
  expenses.forEach(e => {
    csv.push(`${e.desc},${e.amt},${e.date},${e.cat}`);
  });
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'expenses.csv';
  a.click();
});

let categoryChart, monthlyChart;

function updateCharts() {
  const isDark = document.body.classList.contains('dark');
  const fontColor = isDark ? '#ffffff' : '#000000';
  const gridColor = isDark ? '#444' : '#ccc';

  const catData = {};
  const monthData = {};

  expenses.forEach(e => {
    catData[e.cat] = (catData[e.cat] || 0) + e.amt;
    const month = e.date.slice(0, 7);
    monthData[month] = (monthData[month] || 0) + e.amt;
  });

  if (categoryChart) categoryChart.destroy();
  if (monthlyChart) monthlyChart.destroy();

  categoryChart = new Chart(categoryChartEl, {
    type: 'pie',
    data: {
      labels: Object.keys(catData),
      datasets: [{
        data: Object.values(catData),
        backgroundColor: ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f1c40f']
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: fontColor
          }
        }
      }
    }
  });

  monthlyChart = new Chart(monthlyChartEl, {
    type: 'bar',
    data: {
      labels: Object.keys(monthData),
      datasets: [{
        label: 'Monthly Spending',
        data: Object.values(monthData),
        backgroundColor: '#3498db'
      }]
    },
    options: {
      scales: {
        x: {
          ticks: { color: fontColor },
          grid: { color: gridColor }
        },
        y: {
          ticks: { color: fontColor },
          grid: { color: gridColor }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: fontColor
          }
        }
      }
    }
  });
}

saveAndRender();
