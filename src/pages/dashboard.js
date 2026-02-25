import { api } from '../api.js';
import { getMerchant } from '../auth.js';
import { formatCurrency, formatDate, getStatusInfo, showToast, escapeHtml } from '../utils.js';

export function renderDashboard(container) {
  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <h2>Dashboard</h2>
        <p>Mağazanızın genel durumu</p>
      </div>

      <div class="stats-grid" id="stats-grid">
        <div class="stat-card skeleton skeleton-card"></div>
        <div class="stat-card skeleton skeleton-card"></div>
        <div class="stat-card skeleton skeleton-card"></div>
        <div class="stat-card skeleton skeleton-card"></div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Son Siparişler</h3>
        </div>
        <div class="table-wrapper" id="recent-orders-table">
          <div style="padding: 20px;">
            <div class="skeleton skeleton-row"></div>
            <div class="skeleton skeleton-row"></div>
            <div class="skeleton skeleton-row"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  loadDashboardData();
}

async function loadDashboardData() {
  // Load stats
  try {
    const [statsRes, summaryRes] = await Promise.allSettled([
      api.getStats(),
      api.getTodaySummary(),
    ]);

    const stats = statsRes.status === 'fulfilled' ? statsRes.value?.data : null;
    const summary = summaryRes.status === 'fulfilled' ? summaryRes.value?.data : null;

    renderStats(stats, summary);
  } catch (err) {
    console.error('Stats error:', err);
    renderStatsError();
  }

  // Load recent orders
  try {
    const res = await api.getRecentOrders(5);
    const orders = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    renderRecentOrders(orders);
  } catch (err) {
    console.error('Recent orders error:', err);
    document.getElementById('recent-orders-table').innerHTML = `
      <div class="empty-state">
        <p>Siparişler yüklenemedi</p>
        <small>${escapeHtml(err.message)}</small>
      </div>
    `;
  }
}

function renderStats(stats, summary) {
  const grid = document.getElementById('stats-grid');
  if (!grid) return;

  // Use whatever data is available, fallback to zeros
  const totalOrders = stats?.totalOrders ?? summary?.totalOrders ?? 0;
  const totalRevenue = stats?.totalRevenue ?? summary?.totalRevenue ?? 0;
  const pendingOrders = stats?.pendingOrders ?? summary?.pendingOrders ?? 0;
  const totalProducts = stats?.totalProducts ?? summary?.totalProducts ?? 0;

  grid.innerHTML = `
    <div class="stat-card">
      <div class="stat-card-header">
        <div class="stat-icon violet">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
      </div>
      <div class="stat-value">${totalOrders}</div>
      <div class="stat-label">Toplam Sipariş</div>
    </div>

    <div class="stat-card">
      <div class="stat-card-header">
        <div class="stat-icon green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
      </div>
      <div class="stat-value">${formatCurrency(totalRevenue)}</div>
      <div class="stat-label">Toplam Gelir</div>
    </div>

    <div class="stat-card">
      <div class="stat-card-header">
        <div class="stat-icon amber">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
      </div>
      <div class="stat-value">${pendingOrders}</div>
      <div class="stat-label">Bekleyen Siparişler</div>
    </div>

    <div class="stat-card">
      <div class="stat-card-header">
        <div class="stat-icon cyan">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        </div>
      </div>
      <div class="stat-value">${totalProducts}</div>
      <div class="stat-label">Toplam Ürün</div>
    </div>
  `;
}

function renderStatsError() {
  const grid = document.getElementById('stats-grid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="stat-card"><div class="stat-value">-</div><div class="stat-label">Veriler yüklenemedi</div></div>
  `;
}

function renderRecentOrders(orders) {
  const el = document.getElementById('recent-orders-table');
  if (!el) return;

  if (!orders.length) {
    el.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p>Henüz sipariş yok</p>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Sipariş No</th>
          <th>Durum</th>
          <th>Tutar</th>
          <th>Tarih</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => {
    const status = getStatusInfo(order.status);
    return `
            <tr>
              <td><strong>${escapeHtml(order.orderNumber || order.id?.slice(0, 8))}</strong></td>
              <td><span class="badge ${status.class}">${status.label}</span></td>
              <td>${formatCurrency(order.totalAmount)}</td>
              <td>${formatDate(order.createdAt)}</td>
            </tr>
          `;
  }).join('')}
      </tbody>
    </table>
  `;
}
