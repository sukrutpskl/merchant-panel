import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';

async function request(path, options = {}, token = null) {
    const url = `${API_BASE}${path}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return { status: response.status, data };
}

async function forceCleanup(email) {
    console.log(`\n>>> Force Cleanup: ${email}`);
    const loginRes = await request('/api/merchant/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneOrEmail: email, password: 'Deneme123' })
    });
    const token = loginRes.data?.data?.accessToken;
    if (!token) return console.error("Login failed");

    // 1. Delete all products first
    console.log("Deleting all products...");
    const productsRes = await request('/api/merchant/products?pageSize=200', {}, token);
    const products = productsRes.data?.data || [];
    for (const p of products) {
        const delRes = await request(`/api/merchant/products/${p.id}`, { method: 'DELETE' }, token);
        console.log(`- Product Delete ${p.id}: ${delRes.status}`);
    }

    // 2. Delete all categories
    console.log("Deleting all categories...");
    const catsRes = await request('/api/merchant/menu/categories', {}, token);
    const categories = catsRes.data?.data || [];
    for (const c of categories) {
        const delRes = await request(`/api/merchant/menu/categories/${c.id}`, { method: 'DELETE' }, token);
        console.log(`- Category Delete ${c.id} (${c.name}): ${delRes.status} | Data: ${JSON.stringify(delRes.data)}`);
    }
}

async function run() {
    await forceCleanup('rossmann@nedubu.com.tr');
}

run();
