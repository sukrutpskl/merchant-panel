import { api } from '../api.js';
import { getMerchant } from '../auth.js';
import { formatCurrency, formatDate, getStatusInfo, showToast, escapeHtml, ORDER_STATUS } from '../utils.js';

let allOrders = [];
let activeFilter = 'all';

export function renderOrders(container) {
  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <h2>Siparişler</h2>
        <p>Gelen siparişleri takip edin ve yönetin</p>
      </div>

      <div class="status-tabs" id="status-tabs">
        <button class="status-tab active" data-status="all">Tümü</button>
        <button class="status-tab" data-status="0">Beklemede</button>
        <button class="status-tab" data-status="1">Onaylandı</button>
        <button class="status-tab" data-status="2">Hazırlanıyor</button>
        <button class="status-tab" data-status="3">Hazır</button>
        <button class="status-tab" data-status="4">Yolda</button>
        <button class="status-tab" data-status="5">Teslim</button>
        <button class="status-tab" data-status="6">İptal</button>
      </div>

      <div class="card">
        <div class="table-wrapper" id="orders-table">
          <div style="padding: 20px;">
            <div class="skeleton skeleton-row"></div>
            <div class="skeleton skeleton-row"></div>
            <div class="skeleton skeleton-row"></div>
            <div class="skeleton skeleton-row"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  setupOrderEvents();
  loadOrders();
}

function setupOrderEvents() {
  document.getElementById('status-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.status-tab');
    if (!tab) return;
    document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilter = tab.dataset.status;
    renderOrdersTable();
  });
}

async function loadOrders() {
  const merchant = getMerchant();
  if (!merchant?.id) {
    document.getElementById('orders-table').innerHTML = `
      <div class="empty-state"><p>Mağaza bilgisi bulunamadı</p></div>
    `;
    return;
  }

  try {
    const res = await api.getOrders(merchant.id);
    allOrders = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    renderOrdersTable();
  } catch (err) {
    document.getElementById('orders-table').innerHTML = `
      <div class="empty-state">
        <p>Siparişler yüklenemedi</p>
        <small>${escapeHtml(err.message)}</small>
      </div>
    `;
  }
}

function getFilteredOrders() {
  if (activeFilter === 'all') return allOrders;
  return allOrders.filter(o => {
    const statusNum = typeof o.status === 'number' ? o.status : getStatusKeyByName(o.status);
    return String(statusNum) === activeFilter;
  });
}

function getStatusKeyByName(name) {
  const map = { 'Pending': 0, 'Confirmed': 1, 'Preparing': 2, 'Ready': 3, 'OnTheWay': 4, 'Delivered': 5, 'Cancelled': 6, 'Refunded': 7 };
  return map[name] ?? 0;
}

function renderOrdersTable() {
  const el = document.getElementById('orders-table');
  const orders = getFilteredOrders();

  if (!orders.length) {
    el.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p>Bu kategoride sipariş bulunamadı</p>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Sipariş No</th>
          <th>Müşteri</th>
          <th>Ürünler</th>
          <th>Tutar</th>
          <th>Durum</th>
          <th>Tarih</th>
          <th>İşlem</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => renderOrderRow(order)).join('')}
      </tbody>
    </table>
  `;

  // Expand row events
  el.querySelectorAll('.expand-order').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const orderId = e.currentTarget.dataset.orderId;
      toggleOrderDetail(orderId);
    });
  });

  // Status update events
  el.querySelectorAll('.order-status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const orderId = e.target.dataset.orderId;
      const newStatus = parseInt(e.target.value);
      await updateStatus(orderId, newStatus);
    });
  });
}

function renderOrderRow(order) {
  const status = getStatusInfo(order.status);
  const itemCount = order.items?.length || 0;
  const merchant = getMerchant();

  // Build status options
  const statusOptions = Object.entries(ORDER_STATUS).map(([key, val]) => {
    const currentStatusNum = typeof order.status === 'number' ? order.status : getStatusKeyByName(order.status);
    const selected = String(currentStatusNum) === key ? 'selected' : '';
    return `<option value="${key}" ${selected}>${val.label}</option>`;
  }).join('');

  return `
    <tr>
      <td>
        <button class="expand-order" data-order-id="${order.id}" style="background:none;border:none;color:var(--accent-violet);font-weight:600;cursor:pointer;font-size:0.875rem;">
          ${escapeHtml(order.orderNumber || order.id?.slice(0, 8))}
        </button>
      </td>
      <td style="font-size:0.8125rem;">
        <div>${escapeHtml(order.addressTitle || '-')}</div>
        <div style="color:var(--text-muted);font-size:0.75rem;">${escapeHtml(order.fullAddress?.slice(0, 40) || '')}</div>
      </td>
      <td>${itemCount} ürün</td>
      <td><strong>${formatCurrency(order.totalAmount)}</strong></td>
      <td><span class="badge ${status.class}">${status.label}</span></td>
      <td style="font-size:0.8125rem;">${formatDate(order.createdAt)}</td>
      <td>
        <select class="status-select order-status-select" data-order-id="${order.id}">
          ${statusOptions}
        </select>
      </td>
    </tr>
    <tr id="detail-${order.id}" class="hidden">
      <td colspan="7" style="padding:0 16px 16px;">
        ${renderOrderDetail(order)}
      </td>
    </tr>
  `;
}

function renderOrderDetail(order) {
  const items = order.items || [];
  return `
    <div class="order-detail">
      <strong style="font-size:0.8125rem;color:var(--text-secondary);">Sipariş Detayı</strong>
      ${order.note ? `<div style="margin:8px 0;padding:8px 12px;background:rgba(245,158,11,0.1);border-radius:var(--radius-sm);font-size:0.8125rem;color:var(--accent-amber);">📝 ${escapeHtml(order.note)}</div>` : ''}
      <ul class="order-items-list">
        ${items.map(item => `
          <li class="order-item">
            ${item.productImageUrl
      ? `<img class="order-item-image" src="${escapeHtml(item.productImageUrl)}" alt="" />`
      : `<div class="order-item-image" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem;">📦</div>`}
            <div class="order-item-info">
              <div class="order-item-name">${escapeHtml(item.productName)}</div>
              <div class="order-item-qty">${item.quantity}x ${formatCurrency(item.unitPrice)}</div>
              ${item.selectedOptions?.length ? `<div style="font-size:0.7rem;color:var(--text-muted);">${item.selectedOptions.map(o => o.optionName).join(', ')}</div>` : ''}
            </div>
            <div class="order-item-price">${formatCurrency(item.totalPrice)}</div>
          </li>
        `).join('')}
      </ul>
      <div class="order-totals">
        <div class="order-total-row"><span>Ara Toplam</span><span>${formatCurrency(order.subTotal)}</span></div>
        <div class="order-total-row"><span>Teslimat</span><span>${formatCurrency(order.deliveryFee)}</span></div>
        ${order.discount ? `<div class="order-total-row"><span>İndirim</span><span style="color:var(--accent-green)">-${formatCurrency(order.discount)}</span></div>` : ''}
        <div class="order-total-row total"><span>Toplam</span><span>${formatCurrency(order.totalAmount)}</span></div>
      </div>
      ${order.fullAddress ? `<div style="margin-top:12px;font-size:0.8125rem;color:var(--text-secondary);">📍 ${escapeHtml(order.fullAddress)}</div>` : ''}
    </div>
  `;
}

function toggleOrderDetail(orderId) {
  const detail = document.getElementById(`detail-${orderId}`);
  if (detail) {
    detail.classList.toggle('hidden');
  }
}

async function updateStatus(orderId, newStatus) {
  const merchant = getMerchant();
  if (!merchant?.id) return;

  try {
    await api.updateOrderStatus(merchant.id, orderId, newStatus);
    showToast(`Sipariş durumu güncellendi: ${ORDER_STATUS[newStatus]?.label || newStatus}`);
    // Update local data
    const order = allOrders.find(o => o.id === orderId);
    if (order) order.status = newStatus;
    renderOrdersTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
