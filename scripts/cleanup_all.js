import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const password = 'Deneme123';

const merchantsToSeed = [
    'burger@nedubu.com.tr', 'pizza@nedubu.com.tr', 'kebap@nedubu.com.tr',
    'tatli@nedubu.com.tr', 'balik@nedubu.com.tr', 'gratis@nedubu.com.tr',
    'watsons@nedubu.com.tr', 'sephora@nedubu.com.tr', 'flormar@nedubu.com.tr',
    'rossmann@nedubu.com.tr'
];

async function request(path, options = {}, token = null) {
    const url = `${API_BASE}${path}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return { status: response.status, data };
}

async function cleanup(email) {
    console.log(`\n[CLEANUP] → ${email}`);
    const loginRes = await request('/api/merchant/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneOrEmail: email, password })
    });
    const token = loginRes.data?.data?.accessToken;
    if (!token) {
        console.error(`  - Giriş başarısız: ${email}`);
        return;
    }

    // Ürünleri Sil
    const productsRes = await request('/api/merchant/products?pageSize=1000', {}, token);
    const products = productsRes.data?.data || [];
    console.log(`  - ${products.length} ürün siliniyor...`);
    for (const p of products) {
        await request(`/api/merchant/products/${p.id}`, { method: 'DELETE' }, token);
    }

    // Kategorileri Sil
    const catsRes = await request('/api/merchant/menu/categories', {}, token);
    const categories = catsRes.data?.data || [];
    console.log(`  - ${categories.length} kategori siliniyor...`);
    for (const cat of categories) {
        const delRes = await request(`/api/merchant/menu/categories/${cat.id}`, { method: 'DELETE' }, token);
        console.log(`    - Silindi: ${cat.name} | Status: ${delRes.status}`);
    }
}

async function run() {
    console.log('--- GLOBAL TEMİZLİK BAŞLATILDI ---');
    for (const email of merchantsToSeed) {
        await cleanup(email);
    }
    console.log('\n--- TEMİZLİK TAMAMLANDI ---');
}

run();
