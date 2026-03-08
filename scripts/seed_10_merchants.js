import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const password = 'Password123!';

const merchantTemplates = [
    { name: 'Lezzet Durağı Restoran', category: 'Yemek', desc: 'Ev yemekleri ve sulu yemekler' },
    { name: 'Tekno Market', category: 'Elektronik', desc: 'Bilgisayar ve yan ürünler' },
    { name: 'Moda Dünyası', category: 'Giyim', desc: 'Trend kıyafetler ve aksesuarlar' },
    { name: 'Yeşil Market', category: 'Market', desc: 'Taze sebze ve meyve' },
    { name: 'Kitap Kurdu', category: 'Kitap', desc: 'Yeni çıkanlar ve klasikler' },
    { name: 'Mis Kokulu Çiçekçi', category: 'Çiçek', desc: 'Canlı ve yapay çiçek aranjmanları' },
    { name: 'Sporcu Dostu', category: 'Spor', desc: 'Spor aletleri ve giyimi' },
    { name: 'Evim Güzel Evim', category: 'Ev & Yaşam', desc: 'Dekorasyon ve mutfak gereçleri' },
    { name: 'Minik Dostlar Petshop', category: 'Evcil Hayvan', desc: 'Mama ve evcil hayvan aksesuarları' },
    { name: 'Güzellik Atölyesi', category: 'Kozmetik', desc: 'Makyaj ve cilt bakım ürünleri' }
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

async function seedMerchant(template, index) {
    const randomSuffix = Math.floor(Math.random() * 10000);
    const email = `test_merchant_${randomSuffix}_${index + 1}@nedunet.com`;
    const phone = `55500${randomSuffix}${(index + 1).toString().padStart(2, '0')}`.substring(0, 11);

    console.log(`\n--- Seeding Merchant ${index + 1}: ${template.name} ---`);

    // 1. Register
    const regRes = await request('/api/Auth/register', {
        method: 'POST',
        body: JSON.stringify({
            firstName: 'Test',
            lastName: `User ${index + 1}`,
            email,
            phone,
            password,
            role: 2,
            userType: "2"
        })
    });

    if (regRes.status !== 200) {
        console.error(`Register failed for ${email}`, regRes.data);
        return null;
    }

    // 2. User Login
    const loginRes = await request('/api/Auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneOrEmail: email, password })
    });
    const token = loginRes.data?.data?.accessToken;
    if (!token) {
        console.error(`Login failed for ${email}`, loginRes.data);
        return null;
    }

    // 3. Create Merchant Profile
    const merchCreateRes = await request('/api/Merchants', {
        method: 'POST',
        body: JSON.stringify({
            name: template.name,
            description: template.desc,
            phone: phone,
            address: 'Test Adres 123',
            minimumOrderAmount: 50,
            deliveryFee: 15,
            autoAcceptOrders: true,
            preparationTimeMinutes: 25
        })
    }, token);

    if (!merchCreateRes.data?.success && merchCreateRes.status !== 200 && merchCreateRes.status !== 201) {
        console.error(`Merchant profile creation failed for ${template.name}`, merchCreateRes.data);
        return null;
    }

    // 4. Merchant Login (to get merchant specific token/context if needed)
    const merchLogin = await request('/api/merchant/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneOrEmail: email, password })
    });
    const merchToken = merchLogin.data?.data?.accessToken;
    if (!merchToken) {
        console.error(`Merchant Login Failed for ${email}`, merchLogin.data);
        return null;
    }

    // 5. Create Category
    const catRes = await request('/api/merchant/menu/categories', {
        method: 'POST',
        body: JSON.stringify({
            name: template.category,
            description: `${template.name} ana kategorisi`,
            displayOrder: 1
        })
    }, merchToken);

    if (catRes.status === 200 && catRes.data?.data) {
        const catId = catRes.data.data.id;
        console.log(`Category created: ${template.category} (ID: ${catId})`);

        // 6. Create 2-3 Products
        const products = [
            { name: `${template.category} Ürünü 1`, price: 100 + (index * 10) },
            { name: `${template.category} Ürünü 2`, price: 200 + (index * 10) }
        ];

        for (const p of products) {
            await request('/api/merchant/products', {
                method: 'POST',
                body: JSON.stringify({
                    name: p.name,
                    description: `${p.name} açıklaması`,
                    price: p.price,
                    categoryId: catId,
                    imageUrl: 'https://via.placeholder.com/500',
                    variants: [{ name: 'Standart', price: p.price, stock: 100 }]
                })
            }, merchToken);
            console.log(`Product created: ${p.name}`);
        }
    }

    console.log(`Success! Merchant ${template.name} ready.`);
    return { email, password, storeName: template.name };
}

async function run() {
    const results = [];
    for (let i = 0; i < merchantTemplates.length; i++) {
        const res = await seedMerchant(merchantTemplates[i], i);
        if (res) results.push(res);
    }

    console.log('\n\n=========================================');
    console.log('TEST MAĞAZALARI KİMLİK BİLGİLERİ');
    console.log('=========================================');
    results.forEach((r, idx) => {
        console.log(`${idx + 1}. Mağaza: ${r.storeName}`);
        console.log(`   Email: ${r.email}`);
        console.log(`   Şifre: ${r.password}`);
        console.log('-----------------------------------------');
    });
    console.log('Tüm işlemler tamamlandı!');
}

run().catch(console.error);
