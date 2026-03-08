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
    'Margarita': { desc: 'Mozerella peyniri, taze fesleğen ve özel domates soslu ince hamur pizza.', img: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?q=80&w=800' },
    'Karışık Pizza': { desc: 'Sucuk, salam, mısır, zeytin, biber ve mantar ile zengin içerikli.', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800' },
    'Pepperoni': { desc: 'Bol pepperoni dilimleri ve uzayan mozerella peyniri.', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800' },
    'Adana Kebap': { desc: 'Zırhla çekilmiş kuzu eti, közlenmiş domates ve biber eşliğinde klasik lezzet.', img: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=800' },
    'Urfa Kebap': { desc: 'Acısız kuzu kıyma, yanında bulgur pilavı ve sumaklı soğan salatası ile.', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800' },
    'Beyti': { desc: 'Lavaş içine sarılmış kebap, üzerinde yoğurt ve özel tereyağlı sos ile.', img: 'https://images.unsplash.com/photo-1625938140722-23151fa1642c?q=80&w=800' },
    'Et Döner Dürüm': { desc: 'Lavaş ekmeğine sarılı 100gr yaprak döner, patates kızartması ve özel sos.', img: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?q=80&w=800' },
    'Tavuk Döner': { desc: 'Özel marine edilmiş tavuk but etinden, çıtır dürüm içinde.', img: 'https://images.unsplash.com/photo-1633321702518-7feccafacbc8?q=80&w=800' },
    'Baklava': { desc: 'Antep fıstığı, ince yufka ve tereyağı ile hazırlanan geleneksel lezzet.', img: 'https://images.unsplash.com/photo-1519676867240-f03562e6fa1d?q=80&w=800' },
    'Sütlaç': { desc: 'Fırınlanmış, bol sütlü ve pirinçli geleneksel sütlü tatlı.', img: 'https://images.unsplash.com/photo-1621251322961-0aa7f3954602?q=80&w=800' },
    'Künefe': { desc: 'Peynirli, sıcak şerbetli ve Antep fıstıklı meşhur Hatay tatlısı.', img: 'https://images.unsplash.com/photo-1510130335024-115377b3bd31?q=80&w=800' },
    'Maraş Dondurması': { desc: 'Hakiki keçi sütü ve salep ile hazırlanan dövme dondurma.', img: 'https://images.unsplash.com/photo-1563214811-1372551e5f8f?q=80&w=800' },
    'Izgara Çipura': { desc: 'Denizden taze, kömür ateşinde ızgara edilmiş çipura, mevsim salata ile.', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800' },
    'Kalamar Tava': { desc: 'Çıtır pane yapılmış taze kalamar halkaları ve tarator sos.', img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800' },
    'Mevsim Salata': { desc: 'Taze marul, domates, salatalık ve mısır ile hazırlanan klasik salata.', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800' },
    'Gavurdağı': { desc: 'İnce kıyılmış domates, biber, ceviz ve nar ekşili özel Antep salatası.', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800' },
    'Kola 330ml': { desc: 'Soğuk servis edilen klasik ferahlatıcı lezzet.', img: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=800' },
    'Ayran': { desc: 'Tam yağlı yoğurttan geleneksel yöntemlerle hazırlanan serinletici içecek.', img: 'https://images.unsplash.com/photo-1626074353765-517a631e5967?q=80&w=800' },
    'Su': { desc: 'Doğal kaynak suyu, 500ml.', img: 'https://images.unsplash.com/photo-1523362628742-0c29a4519d6d?q=80&w=800' },

    // Kozmetik
    'Mat Ruj': { desc: 'Uzun süre kalıcı mat doku, dudak kurutmayan nemlendirici formül.', img: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=800' },
    'Fondöten': { desc: 'Yüksek kapatıcılık, doğal bitiş ve 24 saat dayanıklılık sağlayan likit yapı.', img: 'https://images.unsplash.com/photo-1596704017254-9b52ffb0ed83?q=80&w=800' },
    'Eyeliner': { desc: 'Ultra siyah, suya dayanıklı ve ince uçlu aplikatörü ile hatasız uygulama.', img: 'https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?q=80&w=800' },
    'Maskara': { desc: 'Hacim veren ve kıvıran özel fırçasıyla dramatik bakışlar.', img: 'https://images.unsplash.com/photo-1591360236660-7db410cdeb75?q=80&w=800' },
    'Nemlendirici Krem': { desc: 'Cildin nem dengesini koruyan, E vitamini özlü günlük bakım kremi.', img: 'https://images.unsplash.com/photo-1620916566398-39f0ef0aeb6c?q=80&w=800' },
    'Yüz Temizleme Jeli': { desc: 'Hassas ciltler için uygun, gözenekleri derinlemesine temizleyen PH dengeli jel.', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800' },
    'Güneş Kremi': { desc: '50+ SPF koruma faktörlü, yağsız ve leke karşıtı güneş koruyucu.', img: 'https://images.unsplash.com/photo-1521223344201-d169129f7b7d?q=80&w=800' },
    'Besleyici Şampuan': { desc: 'Keratin ve argan yağı içerikli, yorgun saçlar için onarıcı bakım.', img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800' },
    'Saç Kremi': { desc: 'Argan yağı ve ipek proteini ile zenginleştirilmiş, kolay tarama sağlayan besleyici krem.', img: 'https://images.unsplash.com/photo-1599305090598-fe179d501c27?q=80&w=800' },
    'Bakım Yağı': { desc: '7 doğal yağ içeren, saç ve tırnaklar için mucizevi onarıcı bakım kompleksi.', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=800' },
    'EDP Kadın Parfümü': { desc: 'Çiçeksi ve odunsu notalar, gün boyu kalıcı büyüleyici koku.', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800' },
    'EDT Erkek Parfümü': { desc: 'Ferah okyanus notaları ve maskülen bitişli günlük parfüm.', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800' },
    'Diş Fırçası': { desc: 'Yumuşak kıllı, diş etlerine zarar vermeyen ergonomik fırça yapısı.', img: 'https://images.unsplash.com/photo-1559591937-e3b2af943ea9?q=80&w=800' },
    'Deodorant': { desc: '24 saat koruma sağlayan, pudralı ve taze kokulu antiperspirant sprey.', img: 'https://images.unsplash.com/photo-1594412217573-047ceb485295?q=80&w=800' }
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

                // Eğer hala detay bulunamadıysa ( fallback durumunda gıda resmi yerine nötr bir görsel )
                if (!productDetails[pName]) {
                    details.img = `https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=800`; // Nötr/Paket görseli
                }

                const price = 150 + Math.floor(Math.random() * 500);
                await request('/api/merchant/products', {
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
