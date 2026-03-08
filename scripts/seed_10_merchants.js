import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const password = 'Deneme123';

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

// Rich product data with descriptions and specific keywords
const productDetails = {
    // Lezzet Durağı
    'Kuru Fasulye': { desc: 'Erzincan dermason fasulyesi, dana kuşbaşı et ve özel tereyağlı sos ile 4 saat ağır ateşte pişirilmiştir.', img: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=800' },
    'İçli Köfte': { desc: 'Antep usulü, incecik dış bulgur katmanı ve bol cevizli kıymalı iç harcı ile kızartılmış 2 adet.', img: 'https://images.unsplash.com/photo-1610636152431-a0832367c31d?q=80&w=800' },
    'Tas Kebabı': { desc: 'Sinirleri alınmış dana eti, arpacık soğan ve taze kekik ile hazırlanan geleneksel bir tencere yemeği.', img: 'https://images.unsplash.com/photo-1547928576-a4a33237cea2?q=80&w=800' },
    'Kuzu Tandır': { desc: 'Kendi suyunda 6 saat pişen kuzu but, yanında iç pilav ve közlenmiş biber ile servis edilir.', img: 'https://images.unsplash.com/photo-1544124499-58912cbddadf?q=80&w=800' },
    'Mercimek Çorbası': { desc: 'Süzme sarı mercimek, kemik suyu ve kruton ekmeği ile hazırlanan besleyici klasik.', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800' },
    'Ezogelin': { desc: 'Kırmızı mercimek, bulgur ve özel baharat karışımı ile hazırlanan doyurucu Anadolu çorbası.', img: 'https://images.unsplash.com/photo-1563245354-921473619f7a?q=80&w=800' },
    'Baklava': { desc: '40 kat ince hamur, Antep fıstığı ve hakiki sade yağ ile hazırlanan çıtır lezzet.', img: 'https://images.unsplash.com/photo-1627376749363-2270967396a5?q=80&w=800' },
    'Künefe': { desc: 'Özel peyniri, kadayıfı ve sıcak şerbetiyle anında servis edilen Hatay klasiği.', img: 'https://images.unsplash.com/photo-1510130335024-115377b3bd31?q=80&w=800' },
    // Tekno Market
    'Laptop Pro 14': { desc: 'M2 Chip, 16GB RAM, 512GB SSD. Profesyonel tasarımcılar ve yazılımcılar için ideal.', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800' },
    'SmartPhone X': { desc: '6.7 inch OLED Ekran, 48MP Kamera. Üst düzey performans ve estetik bir arada.', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800' },
    'Gamer Mouse': { desc: '26.000 DPI Optik Sensör, RGB Aydınlatma. Rekabetçi oyunlar için ultra hafif tasarım.', img: 'https://images.unsplash.com/photo-1527814732934-719533c51ca7?q=80&w=800' },
    'Mekanik Klavye': { desc: 'Mavi Switch, %60 kompakt tasarım, RGB aydınlatma ve hot-swap desteği.', img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800' },
    // Moda Dünyası
    'Yazlık Elbise': { desc: '%100 Pamuklu doku, nefes alan kumaş yapısı ve çiçekli desenleri ile yazın vazgeçilmezi.', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800' },
    'Ceket': { desc: 'Modern kesim, kırışmaz kumaş ve iç cepleri ile her kombine şıklık katar.', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800' },
    'Güneş Gözlüğü': { desc: 'UV400 korumalı camlar, polarize lens yapısı ve ergonomik çerçevesiyle göz alıcı.', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800' },
    // Market
    'Domates (Kg)': { desc: 'Güneşte olgunlaşmış Çanakkale domatesi. Sulu, etli ve tam mevsiminde.', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800' },
    'Tam Yağlı Süt': { desc: 'Günlük çiftlik sütü. Hijyenik koşullarda el değmeden paketlenmiştir.', img: 'https://images.unsplash.com/photo-1550583724-1255d1421000?q=80&w=800' },
    // Kitap Kurdu
    'Dünya Klasikleri Seti': { desc: 'Tolstoy, Dostoyevski ve Balzac eserlerinden oluşan 5 kitaplık özel ciltli set.', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800' },
    '1000 Parça Puzzle': { desc: 'Kaliteli karton baskı, toz bırakmayan kesim ve eşsiz manzara görseli.', img: 'https://images.unsplash.com/photo-1585350803329-307409292851?q=80&w=800' },
    // Çiçekçi
    'Gül Buketi': { desc: 'Aşkın sembolü 11 adet taze kırmızı ekvator gülü, şık kağıt ambalajında.', img: 'https://images.unsplash.com/photo-1561181286-d3fee7d55230?q=80&w=800' },
    'Paşa Kılıcı': { desc: 'Dayanıklı iç mekan bitkisi. Hava temizleme özelliği ile ofis ve evler için ideal.', img: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=800' },
    // Fitness
    'Dambıl Seti': { desc: 'Ayarlanabilir ağırlık plakaları ve kaymaz tutuş gövdesi ile toplam 20kg.', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800' },
    'Mat': { desc: 'Kaymaz TPE malzeme, 6mm kalınlık ve taşıma askısı ile yoga ve fitness için uygun.', img: 'https://images.unsplash.com/photo-1592432231572-13264423408b?q=80&w=800' },
    // Evim Güzel
    'Granit Tencere': { desc: 'Yanmaz yapışmaz granit yüzey, cam kapak ve ısıya dayanıklı kulplar.', img: 'https://images.unsplash.com/photo-1584990333910-fe905206336e?q=80&w=800' },
    'Duvar Saati': { desc: 'Sessiz akar saniye mekanizması, metal çerçeve ve modern numerik tasarım.', img: 'https://images.unsplash.com/photo-1509130298739-651801c76e96?q=80&w=800' },
    // Petshop
    'Yetişkin Kedi Maması': { desc: 'Somonlu ve tavuklu içeriğiyle yetişkin kedilerin tüy sağlığı ve enerji ihtiyacı için.', img: 'https://images.unsplash.com/photo-1589924691106-03fc7af193f4?q=80&w=800' },
    'Kedi Kumu': { desc: 'Kristal yapıda, maksimum koku hapseden ve hızlı topaklanan bentonit kum.', img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800' },
    // Güzellik
    'Nemlendirici Krem': { desc: 'Hyaluronik asit içerikli, 24 saat boyunca yoğun nemlendirme sağlayan hafif formül.', img: 'https://images.unsplash.com/photo-1556228578-8cff4284bcda?q=80&w=800' },
    'Ruj': { desc: 'Kadife dokulu mat bitişli ruj. Uzun süre kalıcı renk pigmentleri ile tüm gün canlılık.', img: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=800' }
};

const genericFallback = (name, type) => `https://images.unsplash.com/featured/800x600?${encodeURIComponent(type + ',' + name)}&sig=${Math.random()}`;

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
    const email = `test_${index + 1}@nedubu.com.tr`;
    const phone = `50000000${(index + 1).toString().padStart(2, '0')}`;

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
        if (!regRes.data?.message?.includes('already in use')) {
            console.error(`Register failed for ${email}`, regRes.data);
            return null;
        }
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

    // --- NEW: CLEANUP STEP ---
    console.log(`  Cleaning up existing data for ${template.name}...`);
    const existingCatsRes = await request('/api/merchant/menu/categories', {}, merchToken);
    if (existingCatsRes.status === 200 && Array.isArray(existingCatsRes.data?.data)) {
        for (const oldCat of existingCatsRes.data.data) {
            await request(`/api/merchant/menu/categories/${oldCat.id}`, { method: 'DELETE' }, merchToken);
        }
        console.log(`  [OK] Old categories and products removed.`);
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
                const details = productDetails[pName] || {
                    desc: `${pName} için özel açıklama ve kalite garantisi.`,
                    img: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800` // Generic high quality food fallback
                };

                await request('/api/merchant/products', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: pName,
                        description: details.desc,
                        price: price,
                        categoryId: catId,
                        imageUrl: details.img,
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
