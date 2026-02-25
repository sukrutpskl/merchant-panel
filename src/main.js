import './style.css';
import { api } from './api.js';
import { isAuthenticated, saveAuthResponse, clearAuth, getMerchant, setMerchant } from './auth.js';
import { showToast } from './utils.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderProducts } from './pages/products.js';
import { renderOrders } from './pages/orders.js';
import { renderStock } from './pages/stock.js';

// ============================================
// APP INITIALIZATION
// ============================================

const pageNames = {
    dashboard: 'Dashboard',
    products: 'Ürünler',
    orders: 'Siparişler',
    stock: 'Stok Yönetimi',
};

function init() {
    setupLoginForm();
    setupSidebar();
    setupLogout();

    // Handle hash routing
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

// ============================================
// ROUTING
// ============================================

function handleRoute() {
    const hash = window.location.hash || '#/login';

    if (!isAuthenticated()) {
        if (hash !== '#/login') {
            window.location.hash = '#/login';
            return;
        }
        showLogin();
        return;
    }

    // Already authenticated
    if (hash === '#/login' || hash === '#/' || hash === '') {
        window.location.hash = '#/dashboard';
        return;
    }

    showApp();
    const page = hash.replace('#/', '');
    renderPage(page);
}

function showLogin() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}

function showApp() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    updateMerchantInfo();
}

function renderPage(page) {
    const container = document.getElementById('main-content');
    const navItems = document.querySelectorAll('.nav-item');

    // Update active nav
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Update mobile title
    const mobileTitle = document.getElementById('mobile-title');
    if (mobileTitle) mobileTitle.textContent = pageNames[page] || page;

    // Close mobile sidebar
    closeMobileSidebar();

    // Render page
    switch (page) {
        case 'dashboard':
            renderDashboard(container);
            break;
        case 'products':
            renderProducts(container);
            break;
        case 'orders':
            renderOrders(container);
            break;
        case 'stock':
            renderStock(container);
            break;
        default:
            renderDashboard(container);
            break;
    }
}

// ============================================
// LOGIN
// ============================================

function setupLoginForm() {
    const form = document.getElementById('login-form');
    const togglePwd = document.querySelector('.toggle-password');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');

        errorEl.classList.add('hidden');
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        btn.disabled = true;

        try {
            const res = await api.login(email, password);

            if (res.success && res.data) {
                saveAuthResponse(res.data);
                showToast('Giriş başarılı');
                window.location.hash = '#/dashboard';
            } else {
                throw new Error(res.message || 'Giriş başarısız');
            }
        } catch (err) {
            errorEl.textContent = err.message || 'Giriş yapılırken bir hata oluştu';
            errorEl.classList.remove('hidden');
        } finally {
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
            btn.disabled = false;
        }
    });

    // Toggle password visibility
    if (togglePwd) {
        togglePwd.addEventListener('click', () => {
            const input = document.getElementById('login-password');
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    }
}

// ============================================
// SIDEBAR
// ============================================

function setupSidebar() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const overlay = document.getElementById('sidebar-overlay');

    mobileMenuBtn?.addEventListener('click', toggleMobileSidebar);
    sidebarToggle?.addEventListener('click', closeMobileSidebar);
    overlay?.addEventListener('click', closeMobileSidebar);
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
}

// ============================================
// MERCHANT INFO
// ============================================

function updateMerchantInfo() {
    const merchant = getMerchant();
    if (!merchant) return;

    const nameEl = document.getElementById('merchant-name');
    const avatarEl = document.getElementById('merchant-avatar');
    const statusEl = document.getElementById('merchant-status');

    if (nameEl) nameEl.textContent = merchant.name || 'Mağaza';
    if (avatarEl) avatarEl.textContent = (merchant.name || 'M').charAt(0).toUpperCase();
    if (statusEl) {
        statusEl.textContent = merchant.isOpen ? 'Açık' : 'Kapalı';
        statusEl.style.color = merchant.isOpen ? 'var(--accent-green)' : 'var(--accent-red)';
    }
}

// ============================================
// LOGOUT
// ============================================

function setupLogout() {
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        try {
            await api.logout();
        } catch (err) {
            console.warn('Logout API error:', err);
        }
        clearAuth();
        showToast('Çıkış yapıldı');
        window.location.hash = '#/login';
    });
}

// ============================================
// START
// ============================================

document.addEventListener('DOMContentLoaded', init);
