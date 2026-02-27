import { api } from '../api.js';
import { formatCurrency, showToast, escapeHtml, formatDate } from '../utils.js';

export function renderReports(container) {
    container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <h2>Satış Raporları</h2>
        <p>Mağazanızın satış istatistiklerini izleyin</p>
      </div>

      <div class="search-bar" style="margin-bottom: 24px;">
        <div class="form-group" style="margin-bottom:0;">
          <input type="date" id="rep-start" class="search-input" style="padding-left:12px;" />
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <input type="date" id="rep-end" class="search-input" style="padding-left:12px;" />
        </div>
        <button class="btn btn-primary" id="rep-filter-btn">
          Raporu Getir
        </button>
      </div>

      <div class="stats-grid" id="reports-stats" style="margin-bottom:24px;">
        <div class="stat-card skeleton skeleton-card"></div>
        <div class="stat-card skeleton skeleton-card"></div>
        <div class="stat-card skeleton skeleton-card"></div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Rapor Detayı</h3>
        </div>
        <div class="table-wrapper" id="reports-table">
          <div style="padding: 20px;">
            <div class="skeleton skeleton-row"></div>
            <div class="skeleton skeleton-row"></div>
          </div>
        </div>
      </div>
    </div>
  `;

    // Set default dates (last 7 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    document.getElementById('rep-start').value = start.toISOString().split('T')[0];
    document.getElementById('rep-end').value = end.toISOString().split('T')[0];

    setupReportEvents();
    loadReportData();
}

function setupReportEvents() {
    document.getElementById('rep-filter-btn').addEventListener('click', () => {
        loadReportData();
    });
}

async function loadReportData() {
    const start = document.getElementById('rep-start').value;
    const end = document.getElementById('rep-end').value;

    try {
        const res = await api.getSalesReport(start, end);
        const data = res?.data || res || { totalSales: 0, orderCount: 0, completedOrders: 0, returnedOrders: 0 };
        renderReportStats(data);
        renderReportTable(data);
    } catch (err) {
        showToast('Rapor verisi alınamadı: ' + err.message, 'error');
    }
}

function renderReportStats(data) {
    const grid = document.getElementById('reports-stats');
    if (!grid) return;

    grid.innerHTML = `
    <div class="stat-card">
      <div class="stat-card-header">
        <div class="stat-icon green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
      </div>
      <div class="stat-value">${formatCurrency(data.totalSales || data.totalRevenue || 0)}</div>
      <div class="stat-label">Toplam Satış Hacmi</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-header">
        <div class="stat-icon violet"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div>
      </div>
      <div class="stat-value">${data.orderCount || data.completedOrders || 0}</div>
      <div class="stat-label">Başarılı Siparişler</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-header">
        <div class="stat-icon amber"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
      </div>
      <div class="stat-value">${data.returnedOrders || data.canceledOrders || 0}</div>
      <div class="stat-label">İptal/İade Edilenler</div>
    </div>
  `;
}

function renderReportTable(data) {
    const el = document.getElementById('reports-table');
    if (!el) return;

    // The API response depends tightly on the DTO. If it doesn't return an items list, we'll just show a "No detailed breakdown" state.
    const items = Array.isArray(data.items) ? data.items : [];

    if (items.length === 0) {
        el.innerHTML = `
      <div class="empty-state">
        <p>Gelişmiş detay verisi API'den gelmedi</p>
        <small>Yukarıdaki özet veriler genel durumu göstermektedir.</small>
      </div>
    `;
        return;
    }

    el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Tarih</th>
          <th>Sipariş No</th>
          <th>Tutar</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(i => `
          <tr>
            <td>${formatDate(i.date || i.createdAt)}</td>
            <td><strong>${escapeHtml(i.orderNumber || '-')}</strong></td>
            <td>${formatCurrency(i.amount)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}
