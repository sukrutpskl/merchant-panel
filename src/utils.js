/**
 * Utility helpers
 */

// Order status mapping
export const ORDER_STATUS = {
    0: { label: 'Beklemede', class: 'badge-pending' },
    1: { label: 'Onaylandı', class: 'badge-confirmed' },
    2: { label: 'Hazırlanıyor', class: 'badge-preparing' },
    3: { label: 'Hazır', class: 'badge-ready' },
    4: { label: 'Yolda', class: 'badge-ontheway' },
    5: { label: 'Teslim Edildi', class: 'badge-delivered' },
    6: { label: 'İptal', class: 'badge-cancelled' },
    7: { label: 'İade', class: 'badge-refunded' },
};

export function getStatusInfo(status) {
    // Handle both numeric and string status
    const key = typeof status === 'string' && isNaN(status) ? getStatusKeyByName(status) : Number(status);
    return ORDER_STATUS[key] || { label: status || 'Bilinmiyor', class: 'badge-pending' };
}

function getStatusKeyByName(name) {
    const map = {
        'Pending': 0, 'Confirmed': 1, 'Preparing': 2, 'Ready': 3,
        'OnTheWay': 4, 'Delivered': 5, 'Cancelled': 6, 'Refunded': 7,
    };
    return map[name] ?? 0;
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount || 0);
}

export function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatDateShort(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

// Toast notification
export function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };

    toast.innerHTML = `${icons[type] || ''}${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Debounce
export function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Escape HTML
export function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Create placeholder image
export function placeholderSvg(text = '📦') {
    return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-card);font-size:2rem;">${text}</div>`;
}
