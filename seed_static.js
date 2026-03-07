import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const email = `yemek.kozmetik@merchant.com`;
const password = 'Password123!';

async function request(path, options = {}, token = null) {
    const url = `${API_BASE}${path}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return { status: response.status, data };
}

async function run() {
    console.log('Registering...', email);
    await request('/api/Auth/register', {
        method: 'POST',
        body: JSON.stringify({ firstName: 'Sabit', lastName: 'Seeder', email, phone: '5559998877', password, role: 2 })
    });

    console.log('Logging in...');
    const loginRes = await request('/api/Auth/login', {
        method: 'POST', body: JSON.stringify({ phoneOrEmail: email, password })
    });
    const token = loginRes.data?.data?.accessToken;
    if (!token) { console.error('Login failed', loginRes); return; }

    console.log('Creating merchant profile...');
    await request('/api/Merchants', {
        method: 'POST', body: JSON.stringify({ name: 'Hazır Yemek ve Kozmetik', description: 'Catalog Seeder 2', phone: '5559998877', address: 'Seed Addr 2', minimumOrderAmount: 10, deliveryFee: 5, autoAcceptOrders: true, preparationTimeMinutes: 20 })
    }, token);

    const merchLogin = await request('/api/merchant/auth/login', {
        method: 'POST', body: JSON.stringify({ phoneOrEmail: email, password })
    });
    const merchToken = merchLogin.data?.data?.accessToken;
    if (!merchToken) { console.error('Merchant Login Failed', merchLogin); return; }

    // Add Categories
    const categories = [
        { name: 'Yemek', displayOrder: 1, desc: 'Lezzetli yemek menüsü' },
        { name: 'Kozmetik', displayOrder: 2, desc: 'Bakım ve güzellik ürünleri' }
    ];

    const catIds = {};
    for (const c of categories) {
        console.log(`Creating category: ${c.name}`);
        const cRes = await request('/api/merchant/menu/categories', {
            method: 'POST', body: JSON.stringify({ name: c.name, description: c.desc, displayOrder: c.displayOrder })
        }, merchToken);
        if (cRes.status === 200 && cRes.data && cRes.data.data) {
            catIds[c.name] = cRes.data.data.id;
        }
    }

    // Add Products
    const products = {
        'Yemek': [
            { name: 'Karışık Pizza', desc: 'Bol malzemeli ince hamur pizza', price: 250, stock: 100, imgUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80' },
            { name: 'Cheese Burger', desc: '150 gr köfte ve cheddar', price: 180, stock: 100, imgUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
            { name: 'Et Döner Dürüm', desc: '100 gr yaprak et döner', price: 140, stock: 100, imgUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80' },
            { name: 'Lahmacun Menü', desc: '3 adet lahmacun ve içecek', price: 220, stock: 100, imgUrl: 'https://images.unsplash.com/photo-1599818815147-19db79a997d5?w=500&q=80' },
            { name: 'Adana Kebap', desc: 'Ateşte pişmiş porsiyon adana', price: 300, stock: 100, imgUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80' }
        ],
        'Kozmetik': [
            { name: 'Kırmızı Ruj', desc: 'Kalıcı mat kırmızı ruj', price: 120, stock: 50, imgUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80' },
            { name: 'Kadın Parfüm 50ml', desc: 'Çiçeksi ve ferah koku', price: 750, stock: 20, imgUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&q=80' },
            { name: 'Likit Fondöten', desc: 'Yüksek kapatıcılık sağlayan fondöten', price: 350, stock: 30, imgUrl: 'https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?w=500&q=80' },
            { name: 'Hacim Veren Maskara', desc: 'Ekstra dolgun gösteren maskara', price: 180, stock: 45, imgUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80' },
            { name: 'Siyah Göz Kalemi', desc: 'Suya dayanıklı akmayan formül', price: 90, stock: 80, imgUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=500&q=80' }
        ]
    };

    for (const catName of Object.keys(products)) {
        const cId = catIds[catName];
        if (!cId) continue;

        for (const p of products[catName]) {
            await request('/api/merchant/products', {
                method: 'POST',
                body: JSON.stringify({
                    name: p.name,
                    description: p.desc,
                    price: p.price,
                    categoryId: cId,
                    imageUrl: p.imgUrl,
                    variants: [{ name: 'Standart', price: p.price, stock: p.stock }]
                })
            }, merchToken);
        }
    }
    console.log('Seeding completed for: yemek.kozmetik@merchant.com');
}

run().catch(console.error);
