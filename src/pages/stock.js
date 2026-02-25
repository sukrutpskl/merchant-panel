import { api } from '../api.js';
import { formatCurrency, showToast, debounce, escapeHtml } from '../utils.js';

let allProducts = [];
let categories = [];

export function renderStock(container) {
  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <h2>Stok Yönetimi</h2>
        <p>Ürün durumlarını kontrol edin ve stok yönetimini yapın</p>
      </div>

      <div class="stats-grid" id="stock-stats" style="margin-bottom: 24px;">
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <div class="stat-value" id="available-count">-</div>
          <div class="stat-label">Aktif Ürün</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
          <div class="stat-value" id="unavailable-count">-</div>
          <div class="stat-label">Pasif Ürün</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon violet">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
          </div>
          <div class="stat-value" id="total-product-count">-</div>
          <div class="stat-label">Toplam Ürün</div>
        </div>
      </div>

      <div class="search-bar" style="margin-bottom: 24px;">
        <div class="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" id="stock-search" placeholder="Ürün ara..." />
        </div>
        <select class="filter-select" id="stock-category-filter">
          <option value="">Tüm Kategoriler</option>
        </select>
        <select class="filter-select" id="stock-status-filter">
          <option value="">Tüm Durumlar</option>
          <option value="available">Aktif</option>
          <option value="unavailable">Pasif</option>
        </select>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Stok Listesi</h3>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-sm btn-secondary" id="bulk-enable" title="Seçilenleri aktif yap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Tümünü Aktif Yap
            </button>
            <button class="btn btn-sm btn-danger" id="bulk-disable" title="Seçilenleri pasif yap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              Tümünü Pasif Yap
            </button>
          </div>
        </div>
        <div id="stock-list">
          <div style="padding: 20px;">
            <div class="skeleton skeleton-row"></div>
            <div class="skeleton skeleton-row"></div>
            <div class="skeleton skeleton-row"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  setupStockEvents();
  loadStockData();
}

function setupStockEvents() {
  document.getElementById('stock-search').addEventListener('input', debounce(() => {
    renderStockList();
  }, 400));

  document.getElementById('stock-category-filter').addEventListener('change', () => renderStockList());
  document.getElementById('stock-status-filter').addEventListener('change', () => renderStockList());

  document.getElementById('bulk-enable').addEventListener('click', () => bulkUpdate(true));
  document.getElementById('bulk-disable').addEventListener('click', () => bulkUpdate(false));
}

async function loadStockData() {
  try {
    // Load categories
    const catRes = await api.getCategories();
    categories = Array.isArray(catRes) ? catRes : (Array.isArray(catRes?.data) ? catRes.data : []);
    const catSelect = document.getElementById('stock-category-filter');
    if (catSelect) {
      catSelect.innerHTML = '<option value="">Tüm Kategoriler</option>' +
        categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    }
  } catch (err) {
    console.error('Categories error:', err);
  }

  try {
    const res = await api.getProducts({ pageSize: 200 });
    allProducts = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    updateStockStats();
    renderStockList();
  } catch (err) {
    document.getElementById('stock-list').innerHTML = `
      <div class="empty-state">
        <p>Ürünler yüklenemedi</p>
        <small>${escapeHtml(err.message)}</small>
      </div>
    `;
  }
}

function updateStockStats() {
  const available = allProducts.filter(p => p.isAvailable).length;
  const unavailable = allProducts.filter(p => !p.isAvailable).length;

  const availEl = document.getElementById('available-count');
  const unavailEl = document.getElementById('unavailable-count');
  const totalEl = document.getElementById('total-product-count');

  if (availEl) availEl.textContent = available;
  if (unavailEl) unavailEl.textContent = unavailable;
  if (totalEl) totalEl.textContent = allProducts.length;
}

function getFilteredStockProducts() {
  const search = document.getElementById('stock-search')?.value?.toLowerCase() || '';
  const categoryId = document.getElementById('stock-category-filter')?.value || '';
  const statusFilter = document.getElementById('stock-status-filter')?.value || '';

  return allProducts.filter(p => {
    if (search && !p.name?.toLowerCase().includes(search) && !p.description?.toLowerCase().includes(search)) return false;
    if (categoryId && p.categoryId !== categoryId) return false;
    if (statusFilter === 'available' && !p.isAvailable) return false;
    if (statusFilter === 'unavailable' && p.isAvailable) return false;
    return true;
  });
}

function renderStockList() {
  const el = document.getElementById('stock-list');
  const products = getFilteredStockProducts();

  if (!products.length) {
    el.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
        <p>Sonuç bulunamadı</p>
      </div>
    `;
    return;
  }

  // Find category names
  const catMap = {};
  categories.forEach(c => catMap[c.id] = c.name);

  el.innerHTML = products.map(p => `
    <div class="stock-item" data-product-id="${p.id}">
      ${p.imageUrl
      ? `<img class="stock-item-image" src="${escapeHtml(p.imageUrl)}" alt="" onerror="this.style.display='none'" />`
      : `<div class="stock-item-image" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;">📦</div>`}
      <div class="stock-item-info">
        <div class="stock-item-name">${escapeHtml(p.name)}</div>
        <div class="stock-item-category">${escapeHtml(catMap[p.categoryId] || 'Kategorisiz')}</div>
      </div>
      <span class="stock-item-price">${formatCurrency(p.price)}</span>
      <span class="badge ${p.isAvailable ? 'badge-available' : 'badge-unavailable'}" style="min-width:60px;justify-content:center;">${p.isAvailable ? 'Aktif' : 'Pasif'}</span>
      <label class="toggle" title="${p.isAvailable ? 'Pasif yap' : 'Aktif yap'}">
        <input type="checkbox" ${p.isAvailable ? 'checked' : ''} data-product-id="${p.id}" class="stock-toggle" />
        <span class="toggle-slider"></span>
      </label>
    </div>
  `).join('');

  // Toggle events
  el.querySelectorAll('.stock-toggle').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const id = e.target.dataset.productId;
      const isAvailable = e.target.checked;
      try {
        await api.updateProductAvailability(id, isAvailable);
        showToast(isAvailable ? 'Ürün aktif edildi' : 'Ürün pasif edildi');
        const product = allProducts.find(p => p.id === id);
        if (product) product.isAvailable = isAvailable;
        updateStockStats();
        renderStockList();
      } catch (err) {
        showToast(err.message, 'error');
        e.target.checked = !isAvailable;
      }
    });
  });
}

async function bulkUpdate(isAvailable) {
  const products = getFilteredStockProducts().filter(p => p.isAvailable !== isAvailable);

  if (!products.length) {
    showToast('Değiştirilecek ürün bulunamadı', 'info');
    return;
  }

  const confirmMsg = `${products.length} ürün ${isAvailable ? 'aktif' : 'pasif'} yapılacak. Devam?`;
  if (!confirm(confirmMsg)) return;

  let success = 0;
  let failed = 0;

  for (const p of products) {
    try {
      await api.updateProductAvailability(p.id, isAvailable);
      p.isAvailable = isAvailable;
      success++;
    } catch {
      failed++;
    }
  }

  showToast(`${success} ürün güncellendi${failed ? `, ${failed} başarısız` : ''}`, failed ? 'error' : 'success');
  updateStockStats();
  renderStockList();
}
