const API_URL = "http://localhost:3000/orders";

async function fetchOrders() {
  try {
    const res = await fetch(API_URL);
    orders = await res.json();
    refreshAll();
  } catch (e) {
    showToast("❌ Error loading data", "error");
  }
}

async function updateStatus(id, status) {
  await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  showToast("✅ Status updated", "success");
  fetchOrders();
}

async function confirmDelete() {
  if (orderToDelete === null) return;
  await fetch(`${API_URL}/${orderToDelete}`, { method: "DELETE" });
  closeDeleteModal();
  showToast('🗑️ Deleted', 'error');
  fetchOrders();
}

async function submitOrder() {
  const customer = document.getElementById('form-customer').value.trim();
  const validItems = formItems.filter(i => i.name);

  if (!customer) { showToast('⚠️ Please enter customer name', 'error'); return; }
  if (validItems.length === 0) { showToast('⚠️ Add at least one item', 'error'); return; }

  const total = validItems.reduce((s, i) => s + (MENU_PRICES[i.name] || 0) * i.qty, 0);

  const newOrder = {
    customerName: customer,
    items: validItems.map(i => i.name),
    totalPrice: total,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newOrder)
  });

  showToast('✅ Order added', 'success');
  fetchOrders();
  navigate('orders');
}

async function rejectOrder(id) { await updateStatus(id, 'rejected'); }
async function completeOrder(id) { await updateStatus(id, 'completed'); }

function openDeleteModal(id) {
  orderToDelete = id;
  document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
  orderToDelete = null;
  document.getElementById('deleteModal').classList.remove('open');
}

const MENU_PRICES = {
  'Margherita Pizza': 70, 'Burger Menu': 80, 'Caesar Salad': 55,
  'Sushi Platter': 150, 'Pasta Bolognese': 95, 'Tacos Mix': 45,
  'Shawarma': 45, 'Fries': 30, 'Soda': 20, 'Water': 10, 'Veggie Pizza': 65,
};

let orders = [];
let currentDashboardFilter = 'all';
let currentOrdersFilter = 'all';
let orderToDelete = null;

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(n => {
    n.classList.remove('active');
    n.classList.add('text-gray-600');
  });
  const nav = document.getElementById('nav-' + page);
  nav.classList.add('active');
  nav.classList.remove('text-gray-600');
  if (page === 'dashboard') renderDashboard();
  if (page === 'orders') renderOrders();
  if (page === 'neworder') resetNewOrderForm();
}

function updateStats() {
  const total = orders.length;
  const pending = orders.filter(o => o.status === 'pending').length;
  const accepted = orders.filter(o => o.status === 'accepted').length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const rejected = orders.filter(o => o.status === 'rejected').length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-accepted').textContent = accepted;
  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('stat-rejected').textContent = rejected;
  document.getElementById('count-all').textContent = total;
  document.getElementById('count-pending').textContent = pending;
  document.getElementById('count-accepted').textContent = accepted;
  document.getElementById('count-completed').textContent = completed;
  document.getElementById('count-rejected').textContent = rejected;
  document.getElementById('pending-badge').textContent = pending;
  document.getElementById('pending-badge').style.display = pending > 0 ? '' : 'none';
  document.getElementById('notif-dot').style.display = pending > 0 ? '' : 'none';
}

function statusConfig(status) {
  const map = {
    pending:   { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    accepted:  { bar: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700',     label: 'Accepted' },
    completed: { bar: 'bg-green-500',  badge: 'bg-green-100 text-green-700',   label: 'Completed' },
    rejected:  { bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700',       label: 'Rejected' },
  };
  return map[status] || map.pending;
}

function buildCard(order) {
  const cfg = statusConfig(order.status);
  const itemsHtml = order.items.map(name =>
    `<div class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-gray-300 rounded-full"></div><p class="text-sm text-gray-600">${name}</p></div>`
  ).join('');

  let actions = '';
  if (order.status === 'pending') {
    actions = `
      <button onclick="rejectOrder('${order.id}')" class="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-500 rounded-full flex items-center justify-center transition" title="Reject">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      <button onclick="updateStatus('${order.id}', 'accepted')" class="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-500 rounded-full flex items-center justify-center transition" title="Accept">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </button>`;
  } else if (order.status === 'accepted') {
    actions = `<button onclick="completeOrder('${order.id}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition">Complete</button>`;
  }

  actions += `
    <button onclick="openDeleteModal('${order.id}')" class="w-8 h-8 bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-400 rounded-full flex items-center justify-center transition" title="Delete">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
    </button>`;

  const div = document.createElement('div');
  div.className = 'bg-white border border-gray-200 rounded-xl overflow-hidden card-enter';
  div.id = 'card-' + order.id;
  div.innerHTML = `
    <div class="h-1.5 ${cfg.bar}"></div>
    <div class="p-5">
      <div class="flex items-center justify-between mb-3">
        <div><h3 class="text-base font-semibold text-gray-800">${order.customerName}</h3><p class="text-xs text-gray-400 mt-0.5">${new Date(order.createdAt).toLocaleString()}</p></div>
        <span class="${cfg.badge} text-xs font-semibold px-3 py-1 rounded-full">${cfg.label}</span>
      </div>
      <div class="space-y-2 mb-4">${itemsHtml}</div>
      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
        <p class="text-lg font-bold text-gray-800">${order.totalPrice} MAD</p>
        <div class="flex items-center gap-2">${actions}</div>
      </div>
    </div>`;
  return div;
}

function renderDashboard() {
  updateStats();
  const container = document.getElementById('dashboard-cards');
  container.innerHTML = '';
  const filtered = currentDashboardFilter === 'all' ? orders : orders.filter(o => o.status === currentDashboardFilter);
  if (filtered.length === 0) {
    container.innerHTML = '<p class="col-span-3 text-center text-gray-400 py-10 text-sm">No orders found.</p>';
    return;
  }
  filtered.forEach(o => container.appendChild(buildCard(o)));
}

function filterDashboard(status) {
  currentDashboardFilter = status;
  document.querySelectorAll('.dashboard-tab').forEach(btn => {
    const isActive = btn.dataset.tab === status;
    btn.classList.toggle('active', isActive);
    btn.classList.toggle('text-blue-600', isActive);
    btn.classList.toggle('text-gray-500', !isActive);
  });
  renderDashboard();
}

function renderOrders() {
  updateStats();
  const search = (document.getElementById('search-input').value || '').toLowerCase();
  let filtered = currentOrdersFilter === 'all' ? orders : orders.filter(o => o.status === currentOrdersFilter);
  if (search) filtered = filtered.filter(o =>
    o.customerName.toLowerCase().includes(search) ||
    o.items.some(name => name.toLowerCase().includes(search))
  );
  const container = document.getElementById('orders-cards');
  const noMsg = document.getElementById('no-orders');
  container.innerHTML = '';
  if (filtered.length === 0) { noMsg.classList.remove('hidden'); }
  else { noMsg.classList.add('hidden'); filtered.forEach(o => container.appendChild(buildCard(o))); }
}

function filterOrders(status) {
  currentOrdersFilter = status;
  document.querySelectorAll('#orders-tabs .filter-tab').forEach(btn => {
    const isActive = btn.dataset.tab === status;
    btn.classList.toggle('active', isActive);
    btn.classList.toggle('text-blue-600', isActive);
    btn.classList.toggle('text-gray-500', !isActive);
  });
  renderOrders();
}

function handleSearch() { renderOrders(); }

function refreshAll() {
  const activePage = document.querySelector('.page.active');
  if (activePage.id === 'page-dashboard') renderDashboard();
  if (activePage.id === 'page-orders') renderOrders();
  updateStats();
}
