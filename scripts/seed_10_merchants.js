import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const password = 'Password123!';

const merchantTemplates = [
    {
        name: 'Lezzet Durağı Restoran',
        desc: 'Geleneksel Türk mutfağının en seçkin lezzetleri.',
        categories: [
            { name: 'Sulu Yemekler', products: ['Kuru Fasulye', 'İçli Köfte', 'Tas Kebabı', 'Kuzu Tandır'] },
            { name: 'Çorbalar', products: ['Mercimek Çorbası', 'Ezogelin', 'Yayla Çorbası'] },
            { name: 'Tatlılar', products: ['Sütlaç', 'Baklava', 'Künefe'] }
        ]
    },
    {
        name: 'Tekno Market',
        desc: 'Son teknoloji cihazlar ve aksesuarlar.',
        categories: [
            { name: 'Bilgisayar', products: ['Laptop Pro 14', 'Oyuncu Bilgisayarı', 'Gamer Mouse', 'Mekanik Klavye'] },
            { name: 'Aksesuar', products: ['Bluetooth Kulaklık', 'Type-C Hub', 'Taşınabilir Disk'] },
            { name: 'Telefon', products: ['SmartPhone X', 'Hızlı Şarj Adaptörü'] }
        ]
    },
    {
        name: 'Moda Dünyası',
        desc: 'Her mevsime uygun şık tasarım kıyafetler.',
        categories: [
            { name: 'Kadın Giyim', products: ['Yazlık Elbise', 'Ceket', 'Saten Gömlek', 'Jean Pantolon'] },
            { name: 'Erkek Giyim', products: ['Slim Fit Gömlek', 'Keten Pantolon', 'Spor Ceket'] },
            { name: 'Aksesuar', products: ['Güneş Gözlüğü', 'Deri Kemer'] }
        ]
    },
    {
        name: 'Yeşil Market',
        desc: 'Taze, organik ve yerel market ürünleri.',
        categories: [
            { name: 'Sebze', products: ['Domates (Kg)', 'Salatalık (Kg)', 'Marul', 'Patates (Kg)'] },
            { name: 'Meyve', products: ['Elma Starking', 'Muz Anamur', 'Çilek'] },
            { name: 'Süt Ürünleri', products: ['Tam Yağlı Süt', 'Beyaz Peynir', 'Yoğurt 2Kg'] }
        ]
    },
    {
        name: 'Kitap Kurdu',
        desc: 'Binlerce kitap ve kırtasiye ürünü bir arada.',
        categories: [
            { name: 'Edebiyat', products: ['Dünya Klasikleri Seti', 'Modern Roman', 'Şiir Antolojisi'] },
            { name: 'Kırtasiye', products: ['Defter 96 Yaprak', 'Dolma Kalem', 'Boyama Seti'] },
            { name: 'Hobi', products: ['1000 Parça Puzzle', 'Akrilik Boya'] }
        ]
    },
    {
        name: 'Mis Kokulu Çiçekçi',
        desc: 'En özel anlarınız için taze çiçek tasarımları.',
        categories: [
            { name: 'Buketler', products: ['Gül Buketi', 'Papatya Aşkı', 'Karışık Mevsim Çiçeği'] },
            { name: 'Saksı Çiçekleri', products: ['Orkide', 'Aloe Vera', 'Paşa Kılıcı'] },
            { name: 'Aranjman', products: ['Cam Vazo Tasarımı', 'Kutuda Çiçek'] }
        ]
    },
    {
        name: 'Sporcu Dostu',
        desc: 'Profesyonel spor ekipmanları ve giyimi.',
        categories: [
            { name: 'Fitness', products: ['Dambıl Seti', 'Mat', 'Ağırlık Eldiveni', 'Antreman Bandı'] },
            { name: 'Giyim', products: ['Dry-Fit Tişört', 'Tayt', 'Koşu Ayakkabısı'] },
            { name: 'Besin Takviyesi', products: ['Protein Tozu', 'BCAA'] }
        ]
    },
    {
        name: 'Evim Güzel Evim',
        desc: 'Eviniz için dekoratif ve pratik çözümler.',
        categories: [
            { name: 'Mutfak', products: ['Granit Tencere', 'Bıçak Seti', 'Baharat Takımı'] },
            { name: 'Dekorasyon', products: ['Duvar Saati', 'Tablo', 'Vazo'] },
            { name: 'Tekstil', products: ['Nevresim Takımı', 'Banyo Havlusu'] }
        ]
    },
    {
        name: 'Minik Dostlar Petshop',
        desc: 'Evcil hayvanlarınız için mama ve oyuncak çeşitleri.',
        categories: [
            { name: 'Kedi', products: ['Yetişkin Kedi Maması', 'Kedi Kumu', 'Tırmalama Tahtası'] },
            { name: 'Köpek', products: ['Köpek Tasması', 'Ödül Maması', 'Tenis Topu'] },
            { name: 'Kuş', products: ['Muhabbet Kuşu Yemi', 'Kafes'] }
        ]
    },
    {
        name: 'Güzellik Atölyesi',
        desc: 'Kişisel bakım ve makyajda profesyonel ürünler.',
        categories: [
            { name: 'Cilt Bakımı', products: ['Nemlendirici Krem', 'Yüz Temizleme Jeli', 'Güneş Kremi'] },
            { name: 'Makyaj', products: ['Ruj', 'Maskara', 'Far Paleti'] },
            { name: 'Saç Bakımı', products: ['Şampuan', 'Saç Kremi'] }
        ]
    }
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
    const batchId = 'batch' + Math.floor(Date.now() / 100000).toString().slice(-4);
    const email = `test_${(index + 1)}_${batchId}@nedunet.com`;
    const phone = `555${batchId}${(index + 1).toString().padStart(2, '0')}`.substring(0, 10);

    console.log(`\n--- Seeding Merchant ${index + 1}: ${template.name} ---`);
    console.log(`Email: ${email} | Phone: ${phone}`);

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

    if (regRes.status !== 200 && !regRes.data?.success) {
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
            address: 'Test Mahalle No:123',
            minimumOrderAmount: 50,
            deliveryFee: 15,
            autoAcceptOrders: true,
            preparationTimeMinutes: 20
        })
    }, token);

    if (merchCreateRes.status !== 200 && !merchCreateRes.data?.success) {
        console.error(`Merchant profile creation failed for ${template.name}`, merchCreateRes.data);
        return null;
    }

    // 4. Merchant Login
    const merchLogin = await request('/api/merchant/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneOrEmail: email, password })
    });
    const merchToken = merchLogin.data?.data?.accessToken;
    if (!merchToken) {
        console.error(`Merchant Login Failed for ${email}`, merchLogin.data);
        return null;
    }

    // 5. Create Categories and Products
    for (const cat of template.categories) {
        const catRes = await request('/api/merchant/menu/categories', {
            method: 'POST',
            body: JSON.stringify({ name: cat.name, description: `${cat.name} kategorisi`, displayOrder: 1 })
        }, merchToken);

        if (catRes.status === 200 && catRes.data?.data) {
            const catId = catRes.data.data.id;
            console.log(`  Category [OK]: ${cat.name}`);

            for (const pName of cat.products) {
                const price = Math.floor(Math.random() * 450) + 50;
                // Generate a high quality Unsplash keyword based on product name
                const keyword = pName.toLowerCase().replace(/ /g, ',');
                const imageUrl = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop&sig=${Math.random()}`;

                // Fine-tuning keywords for better Unsplash results
                let query = pName;
                if (template.name.includes('Restoran')) query = `food,${pName}`;
                if (template.name.includes('Tekno')) query = `tech, electronics,${pName}`;
                if (template.name.includes('Moda')) query = `fashion,clothes,${pName}`;
                if (template.name.includes('Market')) query = `grocery,fresh,${pName}`;
                if (template.name.includes('Kitap')) query = `book,stationery,${pName}`;
                if (template.name.includes('Çiçekçi')) query = `flowers,bouquet,${pName}`;
                if (template.name.includes('Sporcu')) query = `fitness,sports,equipment,${pName}`;
                if (template.name.includes('Evim')) query = `home,decor,furniture,${pName}`;
                if (template.name.includes('Petshop')) query = `pet,dog,cat,${pName}`;
                if (template.name.includes('Güzellik')) query = `beauty,cosmetics,makeup,${pName}`;

                // Using a more reliable way to get themed images without source.unsplash.com
                const themeKeywords = {
                    'Restoran': 'food,restaurant,meal',
                    'Tekno': 'electronics,gadget,technology',
                    'Moda': 'fashion,clothing,apparel',
                    'Market': 'grocery,vegetables,fruits',
                    'Kitap': 'book,library,reading',
                    'Çiçekçi': 'flowers,bouquet,nature',
                    'Sporcu': 'fitness,gym,workout',
                    'Evim': 'home,interior,living',
                    'Petshop': 'pets,dog,cat',
                    'Güzellik': 'cosmetics,beauty,skincare'
                };

                let themeKey = Object.keys(themeKeywords).find(k => template.name.includes(k)) || 'product';
                const finalDynamicUrl = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop`; // High quality generic product as base fallback

                // Fallback to a set of curated Unsplash IDs for reliability
                const curatedImages = {
                    'Mercimek Çorbası': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800',
                    'Kuru Fasulye': 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=800',
                    'Laptop Pro 14': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800',
                    'SmartPhone X': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
                    'Yazlık Elbise': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=800',
                    'Domates (Kg)': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
                    'Dünya Klasikleri Seti': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
                    'Gül Buketi': 'https://images.unsplash.com/photo-1561181286-d3fee7d55230?auto=format&fit=crop&q=80&w=800',
                    'Dambıl Seti': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
                    'Granit Tencere': 'https://images.unsplash.com/photo-1584990333910-fe905206336e?auto=format&fit=crop&q=80&w=800',
                    'Yetişkin Kedi Maması': 'https://images.unsplash.com/photo-1589924691106-03fc7af193f4?auto=format&fit=crop&q=80&w=800',
                    'Nemlendirici Krem': 'https://images.unsplash.com/photo-1556228578-8cff4284bcda?auto=format&fit=crop&q=80&w=800'
                };

                const finalImageUrl = curatedImages[pName] || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop`;

                await request('/api/merchant/products', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: pName,
                        description: `${pName} için harika bir açıklama.`,
                        price: price,
                        categoryId: catId,
                        imageUrl: finalImageUrl,
                        variants: [{ name: 'Standart', price: price, stock: 99 }]
                    })
                }, merchToken);
            }
            console.log(`    Products [OK]: ${cat.products.length} adet`);
        }
    }

    console.log(`Success! ${template.name} seeded.`);
    return { email, password, storeName: template.name };
}

async function run() {
    const results = [];
    for (let i = 0; i < merchantTemplates.length; i++) {
        const res = await seedMerchant(merchantTemplates[i], i);
        if (res) results.push(res);
    }

    console.log('\n\n=========================================');
    console.log('FINAL MERCHANT LIST (COPY TO WALKTHROUGH)');
    console.log('=========================================');
    results.forEach((r, idx) => {
        console.log(`| ${r.storeName} | ${r.email} | ${r.password} |`);
    });
}

run().catch(console.error);
