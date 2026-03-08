import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const password = 'Deneme123';

/**
 * Bu script, Mobil_Mock_Data içerisindeki .dart dosyalarından 
 * elde edilen verileri backend veritabanına aktarmak için tasarlanmıştır.
 */

const merchantsToSeed = [
    // Gıda Mağazaları (food_mock_data.dart)
    { name: 'Burger Sarayı', email: 'burger@nedubu.com.tr', desc: 'Lezzetli burgerlerin tek adresi.', type: 'Gıda', cats: ['Burger', 'Yan Ürünler'], images: { 'Burger': 'burger', 'Yan Ürünler': 'fries' } },
    { name: 'Pizza Dünyası', email: 'pizza@nedubu.com.tr', desc: 'Dünya mutfağından enfes pizzalar.', type: 'Gıda', cats: ['Pizza', 'İçecek'], images: { 'Pizza': 'pizza', 'İçecek': 'drink' } },
    { name: 'Kebapçı Mahmut', email: 'kebap@nedubu.com.tr', desc: 'Geleneksel Türk kebap lezzeti.', type: 'Gıda', cats: ['Kebap', 'Döner', 'Salata'], images: { 'Kebap': 'kebab', 'Döner': 'shawarma', 'Salata': 'salad' } },
    { name: 'Tatlıcı Hasan', email: 'tatli@nedubu.com.tr', desc: 'En tatlı anlarınız için.', type: 'Gıda', cats: ['Tatlı', 'Dondurma'], images: { 'Tatlı': 'dessert', 'Dondurma': 'icecream' } },
    { name: 'Deniz Esintisi', email: 'balik@nedubu.com.tr', desc: 'Taze deniz ürünleri ve balık.', type: 'Gıda', cats: ['Deniz Ürünleri'], images: { 'Deniz Ürünleri': 'fish' } },
    // Kozmetik Mağazaları (mock_cosmetic_catalog_repository.dart)
    { name: 'Gratis Mock', email: 'gratis@nedubu.com.tr', desc: 'Kişisel bakım ve kozmetik dünyası.', type: 'Kozmetik', cats: ['Makyaj', 'Cilt Bakımı', 'Saç Bakımı'], images: { 'Makyaj': 'makeup', 'Cilt Bakımı': 'skincare', 'Saç Bakımı': 'haircare' } },
    { name: 'Watsons Mock', email: 'watsons@nedubu.com.tr', desc: 'Güzelliğiniz için her şey burada.', type: 'Kozmetik', cats: ['Parfüm', 'Cilt Bakımı'], images: { 'Parfüm': 'perfume', 'Cilt Bakımı': 'skincare' } },
    { name: 'Sephora Mock', email: 'sephora@nedubu.com.tr', desc: 'Lüks kozmetik markaları.', type: 'Kozmetik', cats: ['Makyaj', 'Parfüm'], images: { 'Makyaj': 'makeup', 'Parfüm': 'perfume' } },
    { name: 'Flormar Mock', email: 'flormar@nedubu.com.tr', desc: 'Rengarenk makyaj ürünleri.', type: 'Kozmetik', cats: ['Makyaj'], images: { 'Makyaj': 'makeup' } },
    { name: 'Rossmann Mock', email: 'rossmann@nedubu.com.tr', desc: 'Alman kalitesiyle kişisel bakım.', type: 'Kozmetik', cats: ['Saç Bakımı', 'Kişisel Bakım'], images: { 'Saç Bakımı': 'haircare', 'Kişisel Bakım': 'care' } }
];

// Basit ürün mock datası
const productMocks = {
    'Burger': ['Klasik Burger', 'Cheeseburger', 'Double Whopper'],
    'Yan Ürünler': ['Patates Kızartması', 'Soğan Halkası'],
    'Pizza': ['Margarita', 'Karışık Pizza', 'Pepperoni'],
    'İçecek': ['Kola 330ml', 'Ayran', 'Su'],
    'Kebap': ['Adana Kebap', 'Urfa Kebap', 'Beyti'],
    'Döner': ['Et Döner Dürüm', 'Tavuk Döner'],
    'Salata': ['Mevsim Salata', 'Gavurdağı'],
    'Tatlı': ['Baklava', 'Sütlaç', 'Künefe'],
    'Dondurma': ['Maraş Dondurması', 'Meyveli Kup'],
    'Deniz Ürünleri': ['Izgara Çipura', 'Kalamar Tava'],
    'Makyaj': ['Mat Ruj', 'Fondöten', 'Eyeliner', 'Maskara'],
    'Cilt Bakımı': ['Nemlendirici Krem', 'Yüz Temizleme Jeli', 'Güneş Kremi'],
    'Saç Bakımı': ['Besleyici Şampuan', 'Saç Kremi', 'Bakım Yağı'],
    'Parfüm': ['EDP Kadın Parfümü', 'EDT Erkek Parfümü'],
    'Kişisel Bakım': ['Diş Fırçası', 'Deodorant']
};

async function request(path, options = {}, token = null) {
    const url = `${API_BASE}${path}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return { status: response.status, data };
}

async function seed(merch) {
    console.log(`\n>>> İşleniyor: ${merch.name} (${merch.email})`);

    const phone = '500' + Math.floor(Math.random() * 9000000 + 1000000);

    // 1. Kayıt
    const regRes = await request('/api/Auth/register', {
        method: 'POST',
        body: JSON.stringify({
            firstName: 'Mock',
            lastName: merch.name,
            email: merch.email,
            phone,
            password,
            role: 2,
            userType: "2"
        })
    });

    if (regRes.status !== 200 && !regRes.data?.success) {
        if (regRes.data?.message?.includes('already in use')) {
            console.log(`  [!] ${merch.email} zaten var, atlanıyor veya güncelleniyor.`);
        } else {
            console.error(`  [X] Kayıt hatası:`, regRes.data);
            return;
        }
    }

    // 2. Login
    const loginRes = await request('/api/Auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneOrEmail: merch.email, password })
    });
    const token = loginRes.data?.data?.accessToken;
    if (!token) return console.error(`  [X] Giriş hatası!`);

    // 3. Mağaza Oluştur
    const mRes = await request('/api/Merchants', {
        method: 'POST',
        body: JSON.stringify({
            name: merch.name,
            description: merch.desc,
            phone,
            address: merch.type === 'Gıda' ? 'Lezzet Sokak No:1' : 'Güzellik Cad. No:10',
            minimumOrderAmount: 100,
            deliveryFee: 20
        })
    }, token);

    // 4. Mağaza Girişi
    const mLogin = await request('/api/merchant/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneOrEmail: merch.email, password })
    });
    const mToken = mLogin.data?.data?.accessToken;
    if (!mToken) return console.error(`  [X] Mağaza girişi hatası!`);

    // 5. Kategoriler ve Ürünler
    for (const catName of merch.cats) {
        const catRes = await request('/api/merchant/menu/categories', {
            method: 'POST',
            body: JSON.stringify({ name: catName, description: `${catName} kategorisi`, displayOrder: 1 })
        }, mToken);

        if (catRes.status === 200 && catRes.data?.data) {
            const catId = catRes.data.data.id;
            const items = productMocks[catName] || ['Örnek Ürün'];

            for (const pName of items) {
                const q = `${merch.type.toLowerCase()},${catName.toLowerCase()},${pName.toLowerCase()}`;
                const img = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop&sig=${Math.random()}`;
                const finalImg = `https://source.unsplash.com/featured/800x600?${encodeURIComponent(q)}&sig=${Math.random()}`;

                await request('/api/merchant/products', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: pName,
                        description: `${pName} için mock açıklaması.`,
                        price: 150 + Math.floor(Math.random() * 500),
                        categoryId: catId,
                        imageUrl: finalImg,
                        variants: [{ name: 'Standart', price: 150, stock: 100 }]
                    })
                }, mToken);
            }
        }
    }
    console.log(`  [OK] ${merch.name} başarıyla kuruldu.`);
}

async function run() {
    for (const m of merchantsToSeed) {
        await seed(m);
    }
    console.log('\n--- TÜM İŞLEMLER TAMAMLANDI ---');
}

run();
