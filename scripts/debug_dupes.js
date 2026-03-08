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

async function debugMerchant(email) {
    console.log(`\n>>> Debugging: ${email}`);
    const loginRes = await request('/api/merchant/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneOrEmail: email, password: 'Deneme123' })
    });
    const token = loginRes.data?.data?.accessToken;
    if (!token) {
        console.error(`Login failed for ${email}`);
        return;
    }

    const catsRes = await request('/api/merchant/menu/categories', {}, token);
    console.log(`Categories found: ${catsRes.data?.data?.length || 0}`);
    if (Array.isArray(catsRes.data?.data)) {
        catsRes.data.data.forEach(c => {
            console.log(`- ID: ${c.id} | Name: ${c.name} | Deleted: ${c.isDeleted}`);
        });
    }

    const productsRes = await request('/api/merchant/products?pageSize=100', {}, token);
    console.log(`Products found: ${productsRes.data?.data?.length || 0}`);
    if (Array.isArray(productsRes.data?.data)) {
        productsRes.data.data.forEach(p => {
            console.log(`- ID: ${p.id} | Name: ${p.name} | Img: ${p.imageUrl} | Desc: ${p.description.substring(0, 30)}...`);
        });
    }
}

async function run() {
    await debugMerchant('rossmann@nedubu.com.tr');
}

run();
