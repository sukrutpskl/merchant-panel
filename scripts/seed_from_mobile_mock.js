import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';
const password = 'Deneme123';

/**
 * Bu script, Mobil_Mock_Data içerisindeki .dart dosyalarından 
 * elde edilen verileri backend veritabanına aktarmak için tasarlanmıştır.
 * Veriler gerçekçi görseller ve zengin açıklamalarla donatılmıştır.
 */

const merchantsToSeed = [
    // Gıda Mağazaları (food_mock_data.dart)
    { name: 'Burger Sarayı', email: 'burger@nedubu.com.tr', desc: 'Sadece en taze malzemelerle hazırlanan el yapımı burgerler.', type: 'Gıda', cats: ['Burger', 'Yan Ürünler'] },
    { name: 'Pizza Dünyası', email: 'pizza@nedubu.com.tr', desc: 'İtalyan usulü taş fırın pizzaları ve taze atıştırmalıklar.', type: 'Gıda', cats: ['Pizza', 'İçecek'] },
    { name: 'Kebapçı Mahmut', email: 'kebap@nedubu.com.tr', desc: 'Odun ateşinde pişen kebaplar ve geleneksel mezeler.', type: 'Gıda', cats: ['Kebap', 'Döner', 'Salata'] },
    { name: 'Tatlıcı Hasan', email: 'tatli@nedubu.com.tr', desc: 'Nesiller boyu devam eden tatlı geleneğinin temsilcisi.', type: 'Gıda', cats: ['Tatlı', 'Dondurma'] },
    { name: 'Deniz Esintisi', email: 'balik@nedubu.com.tr', desc: 'Günlük taze deniz ürünleri ve eşsiz deniz manzarası eşliğinde.', type: 'Gıda', cats: ['Deniz Ürünleri'] },
    // Kozmetik Mağazaları (mock_cosmetic_catalog_repository.dart)
    { name: 'Gratis Mock', email: 'gratis@nedubu.com.tr', desc: 'Güzellik ve kişisel bakımda binlerce çeşit ürün.', type: 'Kozmetik', cats: ['Makyaj', 'Cilt Bakımı', 'Saç Bakımı'] },
    { name: 'Watsons Mock', email: 'watsons@nedubu.com.tr', desc: 'Güzelliğiniz için dünyaca ünlü markalar ve uzman tavsiyeleri.', type: 'Kozmetik', cats: ['Parfüm', 'Cilt Bakımı'] },
    { name: 'Sephora Mock', email: 'sephora@nedubu.com.tr', desc: 'Lüks kozmetik ve parfüm dünyasının kalbi.', type: 'Kozmetik', cats: ['Makyaj', 'Parfüm'] },
    { name: 'Flormar Mock', email: 'flormar@nedubu.com.tr', desc: 'Renkli ve enerjik makyaj dünyasına hoş geldiniz.', type: 'Kozmetik', cats: ['Makyaj'] },
    { name: 'Rossmann Mock', email: 'rossmann@nedubu.com.tr', desc: 'Alman disiplini ve kalitesiyle kişisel bakım çözümleri.', type: 'Kozmetik', cats: ['Saç Bakımı', 'Kişisel Bakım'] }
];

const productDetails = {
    // Gıda
    'Klasik Burger': { desc: '140gr özel harman süt danası eti, karamelize soğan, marul ve ev yapımı burger sosu.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800' },
    'Cheeseburger': { desc: 'Cheddar peyniri, 140gr dana köfte, turşu ve hardallı mayonez eşliğinde.', img: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=800' },
    'Double Whopper': { desc: 'İki kat dana eti, bol peynir, devasa doyuruculuk ve közlenmiş biber aroması.', img: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800' },
    'Patates Kızartması': { desc: 'Taze kesim patatesler, özel baharat karışımı ve çıtır doku.', img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800' },
    'Soğan Halkası': { desc: 'Dışı çıtır pane, içi sulu tatlı soğan halkaları (8 adet).', img: 'https://images.unsplash.com/photo-1639024471283-03518883512d?q=80&w=800' },
    'Margarita': { desc: 'Mozerella peyniri, taze fesleğen ve özel domates soslu ince hamur pizza.', img: '/uploads/b21c41ad-111e-446a-8db6-d85a6620857d.png' },
    'Karışık Pizza': { desc: 'Sucuk, salam, mısır, zeytin, biber ve mantar ile zengin içerikli.', img: '/uploads/56d2502c-f4d2-4d93-a3cc-7f97919bab10.png' },
    'Pepperoni': { desc: 'Bol pepperoni dilimleri ve uzayan mozerella peyniri.', img: '/uploads/2aef3ca8-b86a-40d4-9cc9-32fbf8ae8790.png' },
    'Adana Kebap': { desc: 'Zırhla çekilmiş kuzu eti, közlenmiş domates ve biber eşliğinde klasik lezzet.', img: '/uploads/4dd6d42f-1226-489e-9ee2-9e19e8b24514.png' },
    'Urfa Kebap': { desc: 'Acısız kuzu kıyma, yanında bulgur pilavı ve sumaklı soğan salatası ile.', img: '/uploads/4dd6d42f-1226-489e-9ee2-9e19e8b24514.png' },
    'Beyti': { desc: 'Lavaş içine sarılmış kebap, üzerinde yoğurt ve özel tereyağlı sos ile.', img: '/uploads/4dd6d42f-1226-489e-9ee2-9e19e8b24514.png' },
    'Et Döner Dürüm': { desc: 'Lavaş ekmeğine sarılı 100gr yaprak döner, patates kızartması ve özel sos.', img: '/uploads/ef680221-2bfc-4337-bf21-3b4020ad9df7.png' },
    'Tavuk Döner': { desc: 'Özel marine edilmiş tavuk but etinden, çıtır dürüm içinde.', img: '/uploads/ef680221-2bfc-4337-bf21-3b4020ad9df7.png' },
    'Baklava': { desc: 'Antep fıstığı, ince yufka ve tereyağı ile hazırlanan geleneksel lezzet.', img: '/uploads/6c3ec9c3-f3ff-4f25-a563-f34dc0f16948.png' },
    'Sütlaç': { desc: 'Fırınlanmış, bol sütlü ve pirinçli geleneksel sütlü tatlı.', img: 'https://images.unsplash.com/photo-1589113331518-910bbd8a7c64?q=80&w=800' },
    'Künefe': { desc: 'Peynirli, sıcak şerbetli ve Antep fıstıklı meşhur Hatay tatlısı.', img: 'https://images.unsplash.com/photo-1608835291093-394b0c943a75?q=80&w=800' },
    'Maraş Dondurması': { desc: 'Hakiki keçi sütü ve salep ile hazırlanan dövme dondurma.', img: '/uploads/2bb09dd8-abba-4003-b23f-9a3bbf382fec.png' },
    'Izgara Çipura': { desc: 'Denizden taze, kömür ateşinde ızgara edilmiş çipura, mevsim salata ile.', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800' },
    'Kalamar Tava': { desc: 'Çıtır pane yapılmış taze kalamar halkaları ve tarator sos.', img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800' },
    'Mevsim Salata': { desc: 'Taze marul, domates, salatalık ve mısır ile hazırlanan klasik salata.', img: '/uploads/98250887-61ef-4d50-99e1-a9c3bb1df420.png' },
    'Gavurdağı': { desc: 'İnce kıyılmış domates, biber, ceviz ve nar ekşili özel Antep salatası.', img: '/uploads/98250887-61ef-4d50-99e1-a9c3bb1df420.png' },
    'Kola 330ml': { desc: 'Soğuk servis edilen klasik ferahlatıcı lezzet.', img: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=800' },
    'Ayran': { desc: 'Tam yağlı yoğurttan geleneksel yöntemlerle hazırlanan serinletici içecek.', img: 'https://images.unsplash.com/photo-1626074353765-517a631e5967?q=80&w=800' },
    'Su': { desc: 'Doğal kaynak suyu, 500ml.', img: 'https://images.unsplash.com/photo-1523362628742-0c29a4519d6d?q=80&w=800' },

    // Kozmetik
    'Mat Ruj': { desc: 'Uzun süre kalıcı mat doku, dudak kurutmayan nemlendirici formül.', img: '/uploads/499b4dfd-08c0-49e6-925a-06abc8d41691.png' },
    'Fondöten': { desc: 'Yüksek kapatıcılık, doğal bitiş ve 24 saat dayanıklılık sağlayan likit yapı.', img: '/uploads/1c567750-1f05-4975-a65b-ee24728b634f.png' },
    'Eyeliner': { desc: 'Ultra siyah, suya dayanıklı ve ince uçlu aplikatörü ile hatasız uygulama.', img: '/uploads/f93b5239-3618-43ab-8267-1798958edcd8.png' },
    'Maskara': { desc: 'Hacim veren ve kıvıran özel fırçasıyla dramatik bakışlar.', img: '/uploads/524bf12c-5056-4433-bc6c-47a3b292a177.png' },
    'Nemlendirici Krem': { desc: 'Cildin nem dengesini koruyan, E vitamini özlü günlük bakım kremi.', img: '/uploads/15238a03-4ba8-4f22-9bce-c584274b76a6.png' },
    'Yüz Temizleme Jeli': { desc: 'Hassas ciltler için uygun, gözenekleri derinlemesine temizleyen PH dengeli jel.', img: '/uploads/f965b02a-9c90-42a1-9c0f-4d89e66992ee.png' },
    'Güneş Kremi': { desc: '50+ SPF koruma faktörlü, yağsız ve leke karşıtı güneş koruyucu.', img: '/uploads/38738970-dade-4469-96d1-831d3ee6f624.png' },
    'Besleyici Şampuan': { desc: 'Keratin ve argan yağı içerikli, yorgun saçlar için onarıcı bakım.', img: '/uploads/5739ab56-374a-4962-9077-806b2c72f6df.png' },
    'Saç Kremi': { desc: 'Argan yağı ve ipek proteini ile zenginleştirilmiş, kolay tarama sağlayan besleyici krem.', img: '/uploads/2900c9d7-4051-4720-8a9c-8e3ed2efa1ed.png' },
    'Bakım Yağı': { desc: '7 doğal yağ içeren, saç ve tırnaklar için mucizevi onarıcı bakım kompleksi.', img: '/uploads/35b474a6-120a-4122-aeee-7741a5a5c365.png' },
    'EDP Kadın Parfümü': { desc: 'Çiçeksi ve odunsu notalar, gün boyu kalıcı büyüleyici koku.', img: '/uploads/11c9d61e-9e3f-4d15-b7a9-6d8c48c6482c.png' },
    'EDT Erkek Parfümü': { desc: 'Ferah okyanus notaları ve maskülen bitişli günlük parfüm.', img: '/uploads/cb5ff95e-bfbc-446b-ae91-ccb539a6bdd3.png' },
    'Diş Fırçası': { desc: 'Yumuşak kıllı, diş etlerine zarar vermeyen ergonomik fırça yapısı.', img: '/uploads/cec4bfb4-cfea-40c5-8a92-d42fd771075c.png' },
    'Deodorant': { desc: '24 saat koruma sağlayan, pudralı ve taze kokulu antiperspirant sprey.', img: '/uploads/70c9c327-1c56-4094-81fd-2e5a6d5191cd.png' }
};

const genericFallback = (name, type) => {
    const isCosmetic = ['Kozmetik', 'Makyaj', 'Cilt Bakımı', 'Saç Bakımı', 'Parfüm', 'Kişisel Bakım'].includes(type);
    const keywords = isCosmetic ? `cosmetic,beauty,${name}` : `food,restaurant,${name}`;
    return `https://images.unsplash.com/featured/800x600?${encodeURIComponent(keywords)}&sig=${Math.random()}`;
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
        if (!regRes.data?.message?.includes('already in use')) {
            console.error(`  [X] Kayıt hatası (${merch.email}):`, regRes.data);
            return;
        } else {
            console.log(`  [!] Kullanıcı zaten var: ${merch.email}`);
        }
    }

    // 2. Login
    const loginRes = await request('/api/Auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneOrEmail: merch.email, password })
    });
    const token = loginRes.data?.data?.accessToken;
    if (!token) {
        console.error(`  [X] Giriş hatası (${merch.email}):`, loginRes.data);
        return;
    }

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
    if (!mToken) {
        console.error(`  [X] Mağaza girişi hatası (${merch.email}):`, mLogin.data);
        return;
    }

    // --- Geliştirilmiş Temizleme ve Seeding Mantığı ---
    console.log(`  Veriler derinlemesine temizleniyor: ${merch.name}...`);

    // 1. Ürünleri temizle
    let productsRefreshed = await request('/api/merchant/products?pageSize=1000', {}, mToken);
    if (productsRefreshed.status === 200 && Array.isArray(productsRefreshed.data?.data)) {
        for (const p of productsRefreshed.data.data) {
            await request(`/api/merchant/products/${p.id}`, { method: 'DELETE' }, mToken);
        }
    }

    // 2. Kategorileri tamamen boşaltana kadar sil (Recursive/Loop)
    let retryCount = 0;
    while (retryCount < 3) {
        const catsRes = await request('/api/merchant/menu/categories', {}, mToken);
        const categories = catsRes.data?.data || [];
        if (categories.length === 0) break;

        console.log(`  - ${categories.length} kategori siliniyor (Deneme ${retryCount + 1})...`);
        for (const cat of categories) {
            await request(`/api/merchant/menu/categories/${cat.id}`, { method: 'DELETE' }, mToken);
        }
        retryCount++;
    }

    // Basit ürün mock datası - Kesin Eşleşme
    const productMocks = {
        'Burger': ['Klasik Burger', 'Cheeseburger', 'Double Whopper'],
        'Yan Ürünler': ['Patates Kızartması', 'Soğan Halkası'],
        'Pizza': ['Margarita', 'Karışık Pizza', 'Pepperoni'],
        'İçecek': ['Kola 330ml', 'Ayran', 'Su'],
        'Kebap': ['Adana Kebap', 'Urfa Kebap', 'Beyti'],
        'Döner': ['Et Döner Dürüm', 'Tavuk Döner'],
        'Salata': ['Mevsim Salata', 'Gavurdağı'],
        'Tatlı': ['Baklava', 'Sütlaç', 'Künefe'],
        'Dondurma': ['Maraş Dondurması'],
        'Deniz Ürünleri': ['Izgara Çipura', 'Kalamar Tava'],
        'Makyaj': ['Mat Ruj', 'Fondöten', 'Eyeliner', 'Maskara'],
        'Cilt Bakımı': ['Nemlendirici Krem', 'Yüz Temizleme Jeli', 'Güneş Kremi'],
        'Saç Bakımı': ['Besleyici Şampuan', 'Saç Kremi', 'Bakım Yağı'],
        'Parfüm': ['EDP Kadın Parfümü', 'EDT Erkek Parfümü'],
        'Kişisel Bakım': ['Diş Fırçası', 'Deodorant']
    };

    // 5. Kategoriler ve Ürünler
    for (const catName of merch.cats) {
        const catRes = await request('/api/merchant/menu/categories', {
            method: 'POST',
            body: JSON.stringify({ name: catName, description: `${catName} kategorisi`, displayOrder: 1 })
        }, mToken);

        if (catRes.status === 200 && catRes.data?.data) {
            const catId = catRes.data.data.id;
            const items = productMocks[catName] || [catName + ' Ürünü'];

            for (const pName of items) {
                const details = productDetails[pName] || {
                    desc: `${pName} için özel içerikli açıklama ve kalite garantisi.`,
                    img: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800` // Default to a neutral item if not found
                };

                // Eğer hala detay bulunamadıysa ( fallback durumunda gıda resmi yerine türe uygun bir görsel )
                if (!productDetails[pName]) {
                    details.img = genericFallback(pName, merch.type === 'Kozmetik' ? 'Kozmetik' : 'Gıda');
                }

                const price = 150 + Math.floor(Math.random() * 500);
                const pRes = await request('/api/merchant/products', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: pName,
                        description: details.desc,
                        price: price,
                        categoryId: catId,
                        imageUrl: details.img,
                        variants: [{ name: 'Standart', price: price, stock: 100 }]
                    })
                }, mToken);
                if (pRes.status !== 200) {
                    console.error(`    [!] Ürün oluşturma hatası (${pName}):`, pRes.data);
                } else {
                    console.log(`    [OK] Ürün oluşturuldu: ${pName}`);
                }
            }
        }
    }
    console.log(`  [OK] ${merch.name} başarıyla kuruldu.`);
}

async function run() {
    console.log('--- GLOBAL VERİ TEMİZLİĞİ VE SEEDING BAŞLATILDI ---');
    for (const m of merchantsToSeed) {
        await seed(m);
    }
    console.log('\n--- TÜM İŞLEMLER BAŞARIYLA TAMAMLANDI ---');
}

run();
