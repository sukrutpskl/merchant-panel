import './style.css';
import { api } from './api.js';
import { isAuthenticated, saveAuthResponse, clearAuth, getMerchant, setMerchant } from './auth.js';
import { showToast } from './utils.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderProducts } from './pages/products.js';
import { renderOrders } from './pages/orders.js';
import { renderStock } from './pages/stock.js';
import { renderCategories } from './pages/categories.js';
import { renderProfile } from './pages/profile.js';
import { renderReports } from './pages/reports.js';

// ============================================
// APP INITIALIZATION
// ============================================

const pageNames = {
    dashboard: 'Ana Sayfa',
    branches: 'Şubeler',
    franchise: 'Franchise',
    products: 'Ürünler',
    categories: 'Ürün Ekle',
    products_view: 'Ürün Görüntüle',
    campaigns: 'Fırsat - Kampanyalar',
    ads: 'İlan ve Reklam',
    wholesale: 'Toptan',
    reports: 'Analiz ve Raporlar',
    'pizza-lazza': 'Pizza Lazza',
    notifications: 'Bildirimler',
    orders: 'Siparişler',
    stock: 'Stok Yönetimi',
    profile: 'Ayarlar'
};

function init() {
    setupLoginForm();
    setupRegisterForm();
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
        item.classList.remove('active');
    });
    document.querySelectorAll('.submenu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Find the item that matches the current page
    let activeItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    let activeSubItem = document.querySelector(`.submenu-item[data-page="${page}"]`);

    if (activeSubItem) {
        activeSubItem.classList.add('active');
        // Find parent submenu
        const submenu = activeSubItem.closest('.nav-submenu');
        if (submenu) {
            submenu.classList.add('open');
            const parentKey = submenu.dataset.parent;
            const parentItem = document.querySelector(`.nav-item[data-page="${parentKey}"]`);
            if (parentItem) {
                parentItem.classList.add('active', 'open');
            }
        }
    } else if (activeItem) {
        activeItem.classList.add('active');
        if (activeItem.classList.contains('has-submenu')) {
            activeItem.classList.add('open');
            const submenu = document.querySelector(`.nav-submenu[data-parent="${page}"]`);
            if (submenu) submenu.classList.add('open');
        }
    }

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
        case 'products_view':
            renderProducts(container);
            break;
        case 'orders':
            renderOrders(container);
            break;
        case 'stock':
            renderStock(container);
            break;
        case 'categories':
            renderCategories(container);
            break;
        case 'profile':
            renderProfile(container);
            break;
        case 'reports':
            renderReports(container);
            break;
        default:
            container.innerHTML = `<div class="page-enter" style="padding:40px; text-align:center;"><h2>Yapım Aşamasında</h2><p>Bu sayfa henüz eklenmedi.</p></div>`;
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
            btnLoader.classList.add('hidden');
            btnText.classList.remove('hidden');
            btn.disabled = false;
        }
    });

    togglePwd.addEventListener('click', () => {
        const input = document.getElementById('login-password');
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
    });

    // Toggle logic
    document.getElementById('go-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
        document.querySelector('.welcome-text-top').textContent = 'Yeni bir mağaza hesabı oluşturun';
    });

    document.getElementById('go-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
        document.querySelector('.welcome-text-top').textContent = "Kurumsal Panel'e Hoş Geldiniz!";
    });
}

function setupRegisterForm() {
    const form = document.getElementById('register-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fname = document.getElementById('reg-fname').value.trim();
        const lname = document.getElementById('reg-lname').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const password = document.getElementById('reg-password').value;
        const merchantName = document.getElementById('reg-mname').value.trim();

        const errorEl = document.getElementById('register-error');
        const btn = document.getElementById('register-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');

        errorEl.classList.add('hidden');
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        btn.disabled = true;

        try {
            // 1. Register User
            const regRes = await api.register({
                firstName: fname,
                lastName: lname,
                email: email,
                phone: phone,
                password: password,
                role: 2 // Merchant role (assuming 2 based on previous tests)
            });

            if (!regRes.success) {
                throw new Error(regRes.message || 'Kayıt başarısız oldu');
            }

            // 2. Login to get token (using base user login, not merchant login)
            const loginRes = await api.userLogin(email, password);
            if (!loginRes.success || !loginRes.data) {
                throw new Error('Kayıt başarılı ancak giriş yapılamadı. Lütfen giriş yapmayı deneyin.');
            }
            saveAuthResponse(loginRes.data);

            // 3. Create Merchant Profile
            const merchRes = await api.createMerchant({
                name: merchantName,
                description: 'Yeni Mağaza',
                phone: phone,
                address: 'Belirtilmedi',
                minimumOrderAmount: 0,
                deliveryFee: 0,
                autoAcceptOrders: false,
                preparationTimeMinutes: 30
            });

            if (merchRes.success) {
                showToast('Mağaza başarıyla oluşturuldu!');

                // Refresh login session to get the latest merchant ID bound to token
                const finalLogin = await api.login(email, password);
                if (finalLogin.success && finalLogin.data) {
                    saveAuthResponse(finalLogin.data);
                }
                window.location.hash = '#/dashboard';
            } else {
                throw new Error(merchRes.message || 'Mağaza profili oluşturulamadı.');
            }

        } catch (err) {
            console.error('Registration error:', err);
            errorEl.textContent = err.message || 'Bir hata oluştu';
            errorEl.classList.remove('hidden');
        } finally {
            btnLoader.classList.add('hidden');
            btnText.classList.remove('hidden');
            btn.disabled = false;
        }
    });
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

    // Submenu Toggle logic
    document.querySelectorAll('.nav-item.has-submenu').forEach(item => {
        item.addEventListener('click', (e) => {
            const page = item.dataset.page;
            const submenu = document.querySelector(`.nav-submenu[data-parent="${page}"]`);
            if (submenu) {
                submenu.classList.toggle('open');
                item.classList.toggle('open');

                // Optional: If we just want to toggle without changing page immediately when clicking the parent
                // e.preventDefault(); 
            }
        });
    });
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

    const navMerchantEl = document.getElementById('nav-merchant-name');
    if (navMerchantEl && merchant.name) {
        navMerchantEl.textContent = merchant.name;
        // Also update page route name so mobile header says the right thing
        pageNames['pizza-lazza'] = merchant.name;
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
