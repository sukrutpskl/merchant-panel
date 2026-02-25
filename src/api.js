import { API_BASE } from './config.js';
import { getToken, getRefreshToken, setTokens, clearAuth, getMerchant } from './auth.js';

/**
 * Central API client with auth interceptor
 */
async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    console.log(`[API] → ${options.method || 'GET'} ${path} | Token: ${token ? 'YES (' + token.substring(0, 20) + '...)' : 'NO'}`);

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Handle 401 — try refreshing token
    if (response.status === 401) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
            headers['Authorization'] = `Bearer ${getToken()}`;
            const retryResponse = await fetch(url, { ...options, headers });
            return handleResponse(retryResponse);
        } else {
            clearAuth();
            window.location.hash = '#/login';
            throw new Error('Oturum süresi doldu');
        }
    }

    return handleResponse(response);
}

async function handleResponse(response) {
    const text = await response.text();
    console.log(`[API] ${response.url} → ${response.status}`, text.substring(0, 300));
    let data;

    // Handle empty response
    if (!text || text.trim() === '') {
        if (response.ok) return { success: true, data: null };
        throw new Error(`HTTP ${response.status}`);
    }

    try {
        data = JSON.parse(text);
    } catch {
        console.error('[API] Non-JSON response:', text.substring(0, 500));
        throw new Error(`Sunucudan geçersiz yanıt (HTTP ${response.status})`);
    }

    if (!response.ok) {
        console.error('[API] Error response:', JSON.stringify(data));
        const errors = data?.errors;
        let errMsg = '';
        if (Array.isArray(errors)) {
            errMsg = errors.join(', ');
        } else if (typeof errors === 'string') {
            errMsg = errors;
        } else if (errors && typeof errors === 'object') {
            // .NET validation errors: { "field": ["error1", "error2"] }
            errMsg = Object.values(errors).flat().join(', ');
        }
        const msg = data?.message || errMsg || `Bir hata oluştu (HTTP ${response.status})`;
        throw new Error(msg);
    }

    return data;
}

async function tryRefreshToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE}/api/merchant/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        if (data.success && data.data) {
            setTokens(data.data.accessToken, data.data.refreshToken, data.data.expiresAt);
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

// --- Helper ---
function getMerchantId() {
    const merchant = getMerchant();
    return merchant?.id || '';
}

// --- API Methods ---

export const api = {
    // Auth
    login(phoneOrEmail, password) {
        return request('/api/merchant/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phoneOrEmail, password }),
        });
    },

    logout() {
        const token = getToken();
        return request('/api/merchant/auth/logout', {
            method: 'POST',
            body: JSON.stringify(token || ''),
        });
    },

    // Dashboard — uses orders data to compute stats
    getStats() {
        // Try merchant dashboard, fallback to computing from orders
        return request('/api/merchant/dashboard/stats').catch(() => {
            return { success: true, data: null };
        });
    },

    getTodaySummary() {
        return request('/api/merchant/dashboard/today-summary').catch(() => {
            return { success: true, data: null };
        });
    },

    getRecentOrders(count = 5) {
        const mid = getMerchantId();
        if (!mid) return Promise.resolve({ success: true, data: [] });
        return request(`/api/merchants/${mid}/orders`);
    },

    // Products — uses Catalog endpoint
    getProducts(params = {}) {
        const mid = getMerchantId();
        if (!mid) return Promise.resolve({ success: true, data: [] });
        const query = new URLSearchParams();
        if (params.categoryId) query.set('categoryId', params.categoryId);
        if (params.search) query.set('search', params.search);
        if (params.page) query.set('page', params.page);
        if (params.pageSize) query.set('pageSize', params.pageSize);
        const qs = query.toString();
        return request(`/api/Catalog/merchants/${mid}/products${qs ? '?' + qs : ''}`);
    },

    getProduct(id) {
        return request(`/api/Catalog/products/${id}`);
    },

    createProduct(data) {
        // Try merchant endpoint, fallback to catalog
        return request('/api/merchant/products', {
            method: 'POST',
            body: JSON.stringify(data),
        }).catch(() => {
            return request('/api/Catalog/products', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        });
    },

    updateProductAvailability(id, isAvailable) {
        return request(`/api/merchant/products/${id}/availability`, {
            method: 'PUT',
            body: JSON.stringify({ isAvailable }),
        }).catch(() => {
            return request(`/api/Catalog/products/${id}/availability`, {
                method: 'PUT',
                body: JSON.stringify({ isAvailable }),
            });
        });
    },

    // Categories (merchant-specific via Catalog)
    getCategories() {
        const mid = getMerchantId();
        if (mid) {
            return request(`/api/Catalog/merchants/${mid}/categories`);
        }
        // Fallback to global categories
        return request('/api/Categories');
    },

    createCategory(data) {
        return request('/api/Catalog/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    deleteCategory(categoryId) {
        return request(`/api/Catalog/categories/${categoryId}`, {
            method: 'DELETE',
        });
    },

    getCategoryProducts(categoryId) {
        return request(`/api/Categories/${categoryId}/products`);
    },

    // Orders
    getOrders(merchantId) {
        return request(`/api/merchants/${merchantId || getMerchantId()}/orders`);
    },

    updateOrderStatus(merchantId, orderId, status, description = '') {
        return request(`/api/merchants/${merchantId || getMerchantId()}/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, description }),
        });
    },

    // Reports
    getSalesReport(startDate, endDate) {
        const query = new URLSearchParams();
        if (startDate) query.set('startDate', startDate);
        if (endDate) query.set('endDate', endDate);
        return request(`/api/merchant/reports/sales?${query.toString()}`).catch(() => {
            return { success: true, data: null };
        });
    },

    // File Upload
    uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        const token = getToken();
        return fetch(`${API_BASE}/api/Files`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        }).then(r => r.json());
    },
};
