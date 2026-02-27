import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const email = 'test4709@merchant.com';
const password = 'Password123!';

async function request(path, options = {}, token = null) {
    const url = `${API_BASE}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }
    return { status: response.status, data };
}

async function runTests() {
    console.log('--- TEST: Login ---');
    const loginRes = await request('/api/merchant/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneOrEmail: email, password })
    });

    if (loginRes.status !== 200 || !loginRes.data.success) {
        console.error('Login failed!', loginRes);
        return;
    }

    const token = loginRes.data.data.accessToken;
    const merchantId = loginRes.data.data.merchant.id || loginRes.data.data.merchantId;
    console.log('Login successful! Token acquired.');
    console.log('Merchant ID:', merchantId);

    // Profile
    console.log('\n--- TEST: Profile ---');
    const profileRes = await request('/api/Merchants/my-profile', {}, token);
    console.log(`Profile: ${profileRes.status}`, profileRes.status === 200 ? 'OK' : profileRes.data);

    // Working Hours
    console.log('\n--- TEST: Working Hours ---');
    if (merchantId) {
        const hoursRes = await request(`/api/Merchants/${merchantId}/working-hours`, {}, token);
        console.log(`Working Hours: ${hoursRes.status}`, hoursRes.status === 200 ? 'OK' : hoursRes.data);
    } else {
        console.log('Skipping Working Hours, missing merchantId');
    }

    // Dashboard Stats
    console.log('\n--- TEST: Dashboard Stats ---');
    const statsRes = await request('/api/merchant/dashboard/stats', {}, token);
    console.log(`Stats: ${statsRes.status}`, statsRes.status === 200 ? 'OK' : statsRes.data);

    const summaryRes = await request('/api/merchant/dashboard/today-summary', {}, token);
    console.log(`Today Summary: ${summaryRes.status}`, summaryRes.status === 200 ? 'OK' : summaryRes.data);

    const recentRes = await request('/api/merchant/dashboard/recent-orders', {}, token);
    console.log(`Recent Orders: ${recentRes.status}`, recentRes.status === 200 ? 'OK' : recentRes.data);

    // Categories
    console.log('\n--- TEST: Categories ---');
    const catRes = await request('/api/merchant/menu/categories', {}, token);
    console.log(`Categories: ${catRes.status}`, catRes.status === 200 ? `OK (${Array.isArray(catRes.data.data || catRes.data) ? (catRes.data.data || catRes.data).length : '?'} items)` : catRes.data);

    // Products
    console.log('\n--- TEST: Products ---');
    const prodRes = await request('/api/merchant/products', {}, token);
    console.log(`Products: ${prodRes.status}`, prodRes.status === 200 ? `OK (${Array.isArray(prodRes.data.data || prodRes.data) ? (prodRes.data.data || prodRes.data).length : '?'} items)` : prodRes.data);

    if (merchantId) {
        console.log('\n--- TEST: Catalog Products ---');
        const catProdRes = await request(`/api/Catalog/merchants/${merchantId}/products`, {}, token);
        console.log(`Catalog Products: ${catProdRes.status}`, catProdRes.status === 200 ? `OK (${Array.isArray(catProdRes.data.data || catProdRes.data) ? (catProdRes.data.data || catProdRes.data).length : '?'} items)` : catProdRes.data);
    }

    // Sales Reports
    console.log('\n--- TEST: Sales Reports ---');
    const start = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const end = new Date().toISOString();
    // Using encoded URI 
    const repRes = await request(`/api/merchant/reports/sales?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`, {}, token);
    console.log(`Reports: ${repRes.status}`, repRes.status === 200 ? 'OK' : repRes.data);
}

runTests().catch(console.error);
