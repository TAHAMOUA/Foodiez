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